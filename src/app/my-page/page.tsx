// src/app/page.tsx
'use client';

import { useState, useMemo, useEffect } from 'react';
import { StudentData, LearningPlan, PlanToSave, AcademyAssignment } from '@/types';
import ChapterSelectModal from '@/components/ChapterSelectModal';
import QuizView from '@/components/QuizView';
import ResultsView from '@/components/ResultsView';
import ActionButtons from '@/components/ActionButtons';
import ReviewModeModal from '@/components/ReviewModeModal';
import LearningPlanSetup from '@/components/LearningPlanSetup';
import CurrentPlanWidget from '@/components/CurrentPlanWidget';
import SetupPromptWidget from '@/components/SetupPromptWidget';
import HomeSkeleton from '@/components/HomeSkeleton';
import RecentActivity from '@/components/RecentActivity';
import StreakWidget from '@/components/StreakWidget';
import AnalysisWidget from '@/components/AnalysisWidget';
import JoinAcademyWidget from '@/components/JoinAcademyWidget';
import JoinAcademyModal from '@/components/JoinAcademyModal';
import AcademyAssignmentManager from '@/components/AcademyAssignmentManager'; 
import { db, functions } from '@/firebase';
import { httpsCallable } from 'firebase/functions';
import { collection, addDoc, serverTimestamp, doc, setDoc, getDoc, getDocs, updateDoc, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { useMyPageData } from '@/hooks/useMyPageData';
import toast from 'react-hot-toast';

type QuizMode = 'new' | 'mixed' | 'review_all' | 'review_incorrect';

export default function Home() {
  const { user } = useAuth();
  const { submissions, totalAnsweredCount, studyStreak, strongestChapter, weakestChapter, loading: dataLoading } = useMyPageData();
  
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [allAssignments, setAllAssignments] = useState<AcademyAssignment[]>([]);
  const [completedAssignmentIds, setCompletedAssignmentIds] = useState<Set<string>>(new Set());
  const [learningPlan, setLearningPlan] = useState<LearningPlan | null>(null);
  
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [isJoinAcademyModalOpen, setIsJoinAcademyModalOpen] = useState(false);

  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [examQuestions, setExamQuestions] = useState<any[] | null>(null);
  const [quizResults, setQuizResults] = useState<{ questions: any[]; userAnswers: (number | null)[] } | null>(null);
  const [selectedQuizMode, setSelectedQuizMode] = useState<QuizMode | null>(null);
  const [currentAssignmentId, setCurrentAssignmentId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setIsDataLoading(false);
      return;
    }
    const studentRef = doc(db, 'students', user.uid);
    const planRef = doc(db, 'learningPlans', user.uid);
    
    const fetchData = async () => {
      setIsDataLoading(true);
      const [studentSnap, planSnap] = await Promise.all([getDoc(studentRef), getDoc(planRef)]);
      
      let currentStudentData = null;
      if (studentSnap.exists()) {
        currentStudentData = studentSnap.data() as StudentData;
        setStudentData(currentStudentData);
      }

      if (planSnap.exists()) {
        setLearningPlan(planSnap.data() as LearningPlan);
      } else {
        setLearningPlan(null);
      }

      if (currentStudentData?.academyName && currentStudentData?.status === 'active') {
        const assignmentQuery = query(
          collection(db, 'academyAssignments'),
          where('academyName', '==', currentStudentData.academyName),
          orderBy('week', 'asc')
        );
        const assignmentSnapshot = await getDocs(assignmentQuery);
        const assignmentsData = assignmentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AcademyAssignment));
        setAllAssignments(assignmentsData);

        const submissionQuery = query(
          collection(db, 'submissions'),
          where('userId', '==', user.uid),
          where('assignmentId', '!=', null)
        );
        const submissionSnapshot = await getDocs(submissionQuery);
        const completedIds = new Set(submissionSnapshot.docs.map(doc => doc.data().assignmentId));
        setCompletedAssignmentIds(completedIds);

      } else {
        setAllAssignments([]);
        setCompletedAssignmentIds(new Set());
      }
      
      setIsDataLoading(false);
    };
    fetchData();
  }, [user]);

  const handleJoinAcademyRequest = async (academyName: string) => {
    if (!user) return;
    const studentRef = doc(db, 'students', user.uid);
    try {
      await updateDoc(studentRef, { academyName: academyName, status: 'pending' });
      setStudentData((prevData) => ({ ...prevData!, academyName, status: 'pending' }));
      setIsJoinAcademyModalOpen(false);
      toast.success(`${academyName}에 가입 요청을 보냈습니다.`);
    } catch (error) {
      toast.error("가입 요청에 실패했습니다.");
    }
  };

  const handleStartAssignment = (assignment: AcademyAssignment) => {
    if (!assignment) return;
    setCurrentAssignmentId(assignment.id);
    setSelectedQuizMode('mixed'); 
    handleSelectionComplete({
      unitIds: assignment.assignedUnitIds,
      count: 30,
      mode: 'mixed'
    });
  };

  const recommendedMode = useMemo(() => {
    if (totalAnsweredCount >= 150) return 'mixed';
    return 'new';
  }, [totalAnsweredCount]);

  const startQuiz = (mode: QuizMode) => {
    setSelectedQuizMode(mode);
    setIsChapterModalOpen(true);
  };
  
  const handleStartReview = () => {
    setIsReviewModalOpen(true);
  };

  const handleReviewModeSelect = (mode: 'review_all' | 'review_incorrect') => {
    setIsReviewModalOpen(false);
    setSelectedQuizMode(mode);
    handleSelectionComplete({ unitIds: [], count: 30, mode });
  };

  const handleSelectionComplete = async (options: { unitIds: string[]; count: number; mode?: QuizMode }) => {
    setIsChapterModalOpen(false);
    setIsLoading(true);
    const modeToRequest = options.mode || selectedQuizMode;
    if (!modeToRequest) {
        toast.error("퀴즈 모드가 선택되지 않았습니다.");
        setIsLoading(false);
        return;
    }
    
    try {
      const generateExamFunction = httpsCallable(functions, 'generateExam');
      const result = await generateExamFunction({ unitIds: options.unitIds, questionCount: options.count, mode: modeToRequest });
      const questions = (result.data as { questions: any[] }).questions;
      setExamQuestions(questions);
      toast.success('시험지가 생성되었습니다!');
    } catch (error) {
      toast.error("시험지를 생성하는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleQuizComplete = async (answers: (number | null)[]) => {
    if (!examQuestions || !user) return;
    let correctCount = 0;
    const incorrectQuestionIds: string[] = [];
    examQuestions.forEach((q, index) => {
      if (q.answerIndex === answers[index]) correctCount++;
      else incorrectQuestionIds.push(q.id);
    });
    const score = Math.round((correctCount / examQuestions.length) * 100);
    const submissionData = {
      userId: user.uid, createdAt: serverTimestamp(), score: score, answers: answers,
      questionIds: examQuestions.map(q => q.id), incorrectQuestionIds: incorrectQuestionIds,
      quizMode: selectedQuizMode, 
      mainChapter: examQuestions[0]?.mainChapter || '여러 단원',
      subChapter: examQuestions[0]?.subChapter || '혼합 학습',
      academyName: studentData?.academyName || null,
      assignmentId: currentAssignmentId,
    };
    try {
      await addDoc(collection(db, "submissions"), submissionData);
      if (currentAssignmentId) {
        setCompletedAssignmentIds(prev => new Set(prev).add(currentAssignmentId));
      }
      toast.success("답안이 저장되었습니다.");
    } catch (error) {
      toast.error("답안 저장에 실패했습니다.");
    }
    setQuizResults({ questions: examQuestions, userAnswers: answers });
    setExamQuestions(null);
    setCurrentAssignmentId(null);
  };
  
  const handleRestart = () => {
    setExamQuestions(null);
    setQuizResults(null);
  };
  
  const handleSavePlan = async (plan: PlanToSave) => {
    if (!user) return;
    const planRef = doc(db, 'learningPlans', user.uid);
    const dataToSave: { [key: string]: any } = {
      ...plan,
      userId: user.uid,
      status: 'active',
      updatedAt: serverTimestamp(),
    };
    if (!learningPlan) {
      dataToSave.createdAt = serverTimestamp();
    }
    await setDoc(planRef, dataToSave, { merge: true });
    const updatedPlanSnap = await getDoc(planRef);
    if (updatedPlanSnap.exists()) {
        setLearningPlan(updatedPlanSnap.data() as LearningPlan);
    }
    setIsSetupModalOpen(false);
    toast.success("학습 계획이 저장되었습니다!");
  };

  if (quizResults) return <ResultsView questions={quizResults.questions} userAnswers={quizResults.userAnswers} onRestart={handleRestart} />;
  if (examQuestions) return <QuizView questions={examQuestions} onQuizComplete={handleQuizComplete} />;
  if (dataLoading || isDataLoading) {
    return (
      <main className="p-8 max-w-2xl mx-auto">
        <HomeSkeleton />
      </main>
    );
  }
  
  const isAcademyStudent = studentData?.academyName && studentData?.status === 'active';

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-slate-800">
            안녕하세요, {user?.displayName || '학습자'}님!
          </h1>
          <p className="text-slate-500 mt-1">
            오늘도 목표를 향해 달려볼까요? 🔥
          </p>
        </div>
        <StreakWidget streakCount={studyStreak} />
      </div>

      {isAcademyStudent ? (
        <AcademyAssignmentManager 
          allAssignments={allAssignments}
          completedAssignmentIds={completedAssignmentIds}
          onStart={handleStartAssignment}
        />
      ) : (
        <>
          {studentData && !studentData.academyName && (
            <JoinAcademyWidget onJoinClick={() => setIsJoinAcademyModalOpen(true)} />
          )}
          {studentData && studentData.status === 'pending' && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg mb-8">
                <p className="font-semibold text-blue-800">{studentData.academyName}의 승인을 기다리는 중입니다.</p>
            </div>
          )}
        </>
      )}
      
      {learningPlan ? (
        <CurrentPlanWidget plan={learningPlan} submissions={submissions} onEditClick={() => setIsSetupModalOpen(true)} />
      ) : (
        <SetupPromptWidget onSetupClick={() => setIsSetupModalOpen(true)} />
      )}
      
      <ActionButtons 
        recommendedMode={recommendedMode}
        onStartNewQuiz={() => startQuiz('new')}
        onStartMixedQuiz={() => startQuiz('mixed')}
        onStartReview={handleStartReview}
      />
      
      <AnalysisWidget strongestChapter={strongestChapter} weakestChapter={weakestChapter} />
      <RecentActivity submissions={submissions} />

      {isJoinAcademyModalOpen && <JoinAcademyModal onClose={() => setIsJoinAcademyModalOpen(false)} onConfirm={handleJoinAcademyRequest} />}
      
      {isChapterModalOpen && 
        <ChapterSelectModal 
          onClose={() => setIsChapterModalOpen(false)} 
          onComplete={(opts) => handleSelectionComplete({ ...opts, mode: selectedQuizMode! })} 
        />
      }

      {isReviewModalOpen && <ReviewModeModal onClose={() => setIsReviewModalOpen(false)} onSelectMode={handleReviewModeSelect} />}
      
      {isSetupModalOpen && <LearningPlanSetup onClose={() => setIsSetupModalOpen(false)} onSave={handleSavePlan} existingPlan={learningPlan} />}
    </main>
  );
}