"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  Settings, 
  Play, 
  BookOpen, 
  BookMarked,
  Sparkles,
  Maximize2,
  Minimize2,
  Volume2,
  Eye,
  EyeOff,
  Lock,
  ChevronLeft,
  CheckCircle,
  XCircle,
  RotateCcw,
  Loader2,
  Home,
  Check,
  X
} from "lucide-react";
import { Card, CardHeader, CardContent, Button, Modal, ModalDialog, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";
import { getLessonDetailsForStudent, startChallengeSession, submitChallengeResult } from "@/actions/lesson";

type LessonData = NonNullable<Awaited<ReturnType<typeof getLessonDetailsForStudent>>>;
type ChallengeQuestion = Awaited<ReturnType<typeof startChallengeSession>>["questions"][number];
type UserAnswer = Parameters<typeof submitChallengeResult>[2][number];
type ResultsOutcome = Awaited<ReturnType<typeof submitChallengeResult>>;

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function LessonPage({ params: paramsPromise }: { params: Promise<{ lessonId: string }> }) {
  const params = use(paramsPromise);
  const lessonId = params.lessonId;

  // DB Data States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lessonData, setLessonData] = useState<LessonData | null>(null);
  
  // Reading Mode settings state
  const [fontSize, setFontSize] = useState<number>(28); // 20px - 44px
  const [showTashkeel, setShowTashkeel] = useState<boolean>(true);
  const [isCreamMode, setIsCreamMode] = useState<boolean>(false);
  const [isSourceOpen, setIsSourceOpen] = useState<boolean>(false);
  const [isHoopoeOpen, setIsHoopoeOpen] = useState<boolean>(true);

  // Lesson view flow state: 'reading' | 'quiz' | 'results'
  const [flowState, setFlowState] = useState<"reading" | "quiz" | "results">("reading");

  // Quiz details state
  const [sessionId, setSessionId] = useState<string>("");
  const [questions, setQuestions] = useState<ChallengeQuestion[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  
  // Submit Outcome state
  const [submittingResult, setSubmittingResult] = useState<boolean>(false);
  const [resultsOutcome, setResultsOutcome] = useState<ResultsOutcome | null>(null);

  // Fetch lesson data on init
  useEffect(() => {
    let isActive = true;

    async function loadLesson() {
      try {
        setLoading(true);
        setError(null);
        const data = await getLessonDetailsForStudent(lessonId);
        if (!isActive) return;
        setLessonData(data);
      } catch (err: unknown) {
        if (!isActive) return;
        setError(getErrorMessage(err, "حدث خطأ غير متوقع أثناء تحميل الدرس"));
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    void loadLesson();

    return () => {
      isActive = false;
    };
  }, [lessonId]);

  // Start the interactive challenge session
  const handleStartChallenge = async () => {
    try {
      setLoading(true);
      const challenge = await startChallengeSession(lessonId);
      setSessionId(challenge.sessionId);
      setQuestions(challenge.questions);
      setCurrentQuestionIdx(0);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setUserAnswers([]);
      setFlowState("quiz");
    } catch (err: unknown) {
      alert(getErrorMessage(err, "فشل توليد الأسئلة للتحدي"));
    } finally {
      setLoading(false);
    }
  };

  // Handle option selection
  const handleSelectOption = (option: string) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(option);
  };

  // Submit single question answer
  const handleSubmitAnswer = () => {
    if (!selectedOption || isAnswerSubmitted) return;

    const currentQ = questions[currentQuestionIdx];
    const isCorrect = selectedOption === currentQ.correctAnswer;

    // Record response
    const answerRecord = {
      conceptId: lessonData?.concept?.id ?? null,
      questionPrompt: currentQ.questionPrompt,
      userAnswer: selectedOption,
      correctAnswer: currentQ.correctAnswer,
      isCorrect,
      explanation: currentQ.explanation
    };

    setUserAnswers([...userAnswers, answerRecord]);
    setIsAnswerSubmitted(true);
  };

  // Proceed to next question or complete challenge
  const handleNextQuestion = async () => {
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      // End of quiz, submit all results to server
      await submitAllResults();
    }
  };

  const submitAllResults = async () => {
    try {
      setSubmittingResult(true);
      setFlowState("results");
      const outcome = await submitChallengeResult(sessionId, lessonId, userAnswers);
      setResultsOutcome(outcome);
    } catch (err: unknown) {
      alert(getErrorMessage(err, "فشل تسجيل نتائج التحدي"));
    } finally {
      setSubmittingResult(false);
    }
  };

  // Reset challenge to retry
  const handleRetryChallenge = () => {
    handleStartChallenge();
  };

  // Helper to remove Arabic diacritics dynamically
  const stripTashkeel = (text: string) => {
    return text.replace(/[\u064B-\u0652]/g, "");
  };

  if (loading && flowState === "reading") {
    return (
      <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-brand-emerald-500 animate-spin" />
        <p className="text-slate-400 text-sm">جاري تحميل الدرس الفقهي...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <Card className="glass-panel border-rose-500/20 max-w-md p-6 space-y-4">
          <XCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold">عذراً، تعذر فتح الدرس</h2>
          <p className="text-xs text-slate-400">{error}</p>
          <Link href="/dashboard" className="inline-block bg-slate-900 border border-slate-800 hover:bg-slate-850 px-4 py-2 rounded-xl text-xs font-bold text-slate-200">
            العودة للوحة التحكم
          </Link>
        </Card>
      </div>
    );
  }

  if (!lessonData) {
    return (
      <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-brand-emerald-500 animate-spin" />
        <p className="text-slate-400 text-sm">جاري تجهيز بيانات الدرس...</p>
      </div>
    );
  }

  const { lesson, concept, reference, isLocked } = lessonData;

  // Progression Lock Screen block
  if (isLocked) {
    return (
      <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col items-center justify-center p-4">
        <Card className="glass-panel border-slate-850 max-w-md p-6 space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-slate-200">هذا الدرس مغلق حالياً 🔒</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              وفقاً لقفل المنهج المعتمد، يجب عليك أولاً إكمال ودراسة الدروس السابقة واجتياز تحدياتها بنجاح قبل فك قفل هذا الدرس.
            </p>
          </div>
          <Link 
            href="/dashboard" 
            className="w-full bg-brand-emerald-500 hover:bg-brand-emerald-600 text-slate-950 font-black text-xs py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/10"
          >
            <Home className="w-4 h-4" />
            <span>العودة للوحة التقدم الفقهي</span>
          </Link>
        </Card>
      </div>
    );
  }

  const displayText = showTashkeel ? lesson.content : stripTashkeel(lesson.content);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans p-4 md:p-8 flex flex-col items-center">
      {/* Background gradients */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 left-0 w-[400px] h-[400px] rounded-full bg-amber-500/5 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-3xl space-y-6 z-10">
        
        {/* Navigation header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2.5 bg-slate-900/60 rounded-xl hover:bg-slate-800 text-slate-300 transition-all border border-slate-800/40">
              <ArrowRight className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg md:text-xl font-extrabold text-slate-200">الدرس: {lesson.title}</h1>
              <p className="text-[10px] text-brand-emerald-400 font-medium">باب الطهارة • سفينة النجاة</p>
            </div>
          </div>
          
          <Button 
            className="bg-slate-900/60 border border-slate-850 hover:bg-slate-850 text-brand-emerald-400 p-2.5 rounded-xl cursor-pointer"
            aria-label="استمع إلى المتن الفقهي"
          >
            <Volume2 className="w-5 h-5" />
          </Button>
        </div>

        {/* FLOW 1: READING MODE */}
        {flowState === "reading" && (
          <div className="space-y-6">
            {/* Reading settings panel */}
            <Card className="glass-panel border-slate-800/50 text-slate-100">
              <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                  <Settings className="w-4 h-4 text-brand-emerald-500" /> إعدادات وضع القراءة الفاخر:
                </span>

                <div className="flex items-center gap-3 flex-wrap">
                  {/* Font Size control */}
                  <div className="flex items-center bg-slate-900/60 border border-slate-800/60 rounded-xl p-1 gap-1">
                    <Button 
                      isDisabled={fontSize <= 20} 
                      onClick={() => setFontSize(f => Math.max(20, f - 4))}
                      className="bg-transparent text-slate-400 hover:text-slate-200 min-w-8 h-8 rounded-lg"
                    >
                      <Minimize2 className="w-4 h-4" />
                    </Button>
                    <span className="text-xs font-bold px-2 text-slate-300">{fontSize}px</span>
                    <Button 
                      isDisabled={fontSize >= 44} 
                      onClick={() => setFontSize(f => Math.min(44, f + 4))}
                      className="bg-transparent text-slate-400 hover:text-slate-200 min-w-8 h-8 rounded-lg"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Diacritics Toggle */}
                  <Button 
                    onClick={() => setShowTashkeel(!showTashkeel)}
                    className={`text-xs font-bold px-3 py-1.5 h-10 rounded-xl border cursor-pointer transition-all flex items-center gap-1.5 ${
                      showTashkeel 
                        ? "bg-brand-emerald-500/10 text-brand-emerald-400 border-brand-emerald-500/30" 
                        : "bg-slate-900/60 text-slate-400 border-slate-800/80"
                    }`}
                  >
                    {showTashkeel ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    <span>التشكيل</span>
                  </Button>

                  {/* Warm Cream Toggle */}
                  <Button 
                    onClick={() => setIsCreamMode(!isCreamMode)}
                    className={`text-xs font-bold px-3 py-1.5 h-10 rounded-xl border cursor-pointer transition-all flex items-center gap-1.5 ${
                      isCreamMode 
                        ? "bg-amber-100 text-slate-900 border-amber-200" 
                        : "bg-slate-900/60 text-slate-400 border-slate-800/80"
                    }`}
                  >
                    <span>الوضع الدافئ</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Stateful Reader Pane */}
            <Card className={`border transition-all duration-300 ${
              isCreamMode 
                ? "bg-[#fdfbf7] text-[#1c1917] border-amber-200/50 shadow-xl shadow-amber-950/5" 
                : "glass-panel border-brand-emerald-800/15 text-slate-100"
            }`}>
              <CardHeader className="pb-2 flex justify-between items-center border-b border-slate-800/10">
                <span className={`text-xs font-bold flex items-center gap-1.5 ${isCreamMode ? "text-amber-800" : "text-brand-emerald-400"}`}>
                  <BookOpen className="w-4 h-4" /> المتن الفقهي المعتمد
                </span>
                <span className={`text-[10px] ${isCreamMode ? "text-slate-500" : "text-slate-400"}`}>خط المتن: Amiri Serif</span>
              </CardHeader>
              <CardContent className="py-6 space-y-6">
                
                {/* Arabic text with dynamic font size and diacritics */}
                <p 
                  className={`font-serif leading-loose text-center p-6 rounded-2xl border transition-all duration-300 ${
                    isCreamMode 
                      ? "bg-[#f4efe2] text-[#1c1917] border-amber-200/60" 
                      : "bg-emerald-950/25 text-emerald-100 border-brand-emerald-800/10"
                  }`}
                  style={{ fontSize: `${fontSize}px` }}
                >
                  {displayText}
                </p>

                {/* Explanatory notes */}
                {reference?.explanation && (
                  <div className="space-y-2 pt-2">
                    <h3 className={`text-xs font-bold ${isCreamMode ? "text-amber-800" : "text-brand-gold-400"}`}>الشرح المعتمد:</h3>
                    <p className={`text-sm leading-relaxed font-sans ${isCreamMode ? "text-slate-800" : "text-slate-300"}`}>
                      {reference.explanation}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Fiqh Source card */}
            {reference && (
              <div className="bg-slate-900/30 border border-slate-800/60 rounded-xl p-4 flex justify-between items-center text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <BookMarked className="w-4 h-4 text-brand-emerald-400" />
                  <span>المصدر: <b className="text-slate-200">{reference.sourceBook}</b> - {reference.sourceSection} {reference.pageNumber && `(صفحة ${reference.pageNumber})`}</span>
                </span>
                <Button 
                  onClick={() => setIsSourceOpen(true)}
                  className="bg-brand-emerald-500/10 text-brand-emerald-400 border border-brand-emerald-500/25 px-3 py-1 rounded-lg hover:bg-brand-emerald-500/20 text-[10px] font-bold cursor-pointer transition-all"
                >
                  اعرض الدليل والتخريج
                </Button>
              </div>
            )}

            {/* Wise Hoopoe (الهدهد الحكيم) Mascot Guide Component */}
            {isHoopoeOpen && concept?.notesForAdvancedStudents && (
              <div className="bg-[#0b1429]/90 border border-brand-emerald-800/25 rounded-2xl p-5 flex items-start gap-4 shadow-lg shadow-emerald-950/10 relative overflow-hidden group hover:border-brand-emerald-700/40 transition-all duration-300">
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-brand-gold-500/5 blur-xl pointer-events-none" />
                <div className="w-12 h-12 rounded-full bg-brand-gold-500/10 border border-brand-gold-500/30 flex items-center justify-center text-2xl shadow-inner shrink-0">
                  🪶
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-black text-brand-gold-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> تنبيه الهدهد الحكيم:
                    </h4>
                    <Button 
                      onClick={() => setIsHoopoeOpen(false)}
                      className="text-[9px] text-slate-500 hover:text-slate-300 bg-transparent min-w-0 p-0 h-auto"
                    >
                      إخفاء التنبيه
                    </Button>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {concept.notesForAdvancedStudents}
                  </p>
                </div>
              </div>
            )}

            {/* Start Challenge button */}
            <Button 
              onClick={handleStartChallenge}
              className="w-full h-14 bg-brand-emerald-500 hover:bg-brand-emerald-600 text-slate-950 font-black text-base rounded-2xl cursor-pointer shadow-lg shadow-emerald-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5 fill-slate-950" />
              <span>ابدأ التحدي والمسائل الفقهية</span>
            </Button>
          </div>
        )}

        {/* FLOW 2: INTERACTIVE QUIZ MODE */}
        {flowState === "quiz" && questions.length > 0 && (
          <div className="space-y-6">
            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400 font-bold">
                <span>مسائل التحدي:</span>
                <span>{currentQuestionIdx + 1} من {questions.length}</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-850">
                <div 
                  className="bg-brand-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIdx + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Current Question prompt */}
            <Card className="glass-panel border-slate-800 text-slate-100 shadow-xl">
              <CardHeader className="pb-1 text-slate-400 text-[10px] font-bold tracking-wider uppercase">
                {questions[currentQuestionIdx].type === "apply" ? "مسألة تطبيقية ✍️" : "سؤال الاستذكار 🧠"}
              </CardHeader>
              <CardContent className="py-4">
                <p className="text-base font-extrabold text-slate-200 leading-relaxed">
                  {questions[currentQuestionIdx].questionPrompt}
                </p>
              </CardContent>
            </Card>

            {/* Options list */}
            <div className="grid grid-cols-1 gap-3">
              {questions[currentQuestionIdx].options.map((opt: string, idx: number) => {
                const isCorrectOption = opt === questions[currentQuestionIdx].correctAnswer;
                const isSelected = opt === selectedOption;
                
                // Color formatting logic
                let optionStyle = "bg-slate-900/40 border-slate-800 hover:border-brand-emerald-500/30 text-slate-200";
                
                if (isAnswerSubmitted) {
                  if (isCorrectOption) {
                    optionStyle = "bg-brand-emerald-500/10 border-brand-emerald-500 text-brand-emerald-400 font-bold shadow-lg shadow-emerald-950/10";
                  } else if (isSelected) {
                    optionStyle = "bg-rose-500/10 border-rose-500 text-rose-400";
                  } else {
                    optionStyle = "bg-slate-900/10 border-slate-900 text-slate-500 opacity-60";
                  }
                } else if (isSelected) {
                  optionStyle = "bg-[#0b1429] border-brand-emerald-500 text-brand-emerald-400 shadow-md shadow-emerald-500/5";
                }

                return (
                  <Button 
                    key={idx}
                    onClick={() => handleSelectOption(opt)}
                    isDisabled={isAnswerSubmitted}
                    className={`w-full py-4 min-h-12 rounded-xl border flex items-center justify-between text-right px-4 cursor-pointer text-xs transition-all ${optionStyle}`}
                  >
                    <span>{opt}</span>
                    {isAnswerSubmitted && isCorrectOption && <Check className="w-4 h-4 text-brand-emerald-400 shrink-0" />}
                    {isAnswerSubmitted && isSelected && !isCorrectOption && <X className="w-4 h-4 text-rose-400 shrink-0" />}
                  </Button>
                );
              })}
            </div>

            {/* Answer feedback & Explanation block */}
            {isAnswerSubmitted && (
              <Card className={`border transition-all duration-300 ${
                userAnswers[currentQuestionIdx]?.isCorrect 
                  ? "bg-brand-emerald-950/20 border-brand-emerald-800/30" 
                  : "bg-rose-950/10 border-rose-900/20"
              }`}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    {userAnswers[currentQuestionIdx]?.isCorrect ? (
                      <span className="text-brand-emerald-400 font-extrabold text-xs flex items-center gap-1">
                        <CheckCircle className="w-4.5 h-4.5" /> إجابة صحيحة وموفقة!
                      </span>
                    ) : (
                      <span className="text-rose-400 font-extrabold text-xs flex items-center gap-1">
                        <XCircle className="w-4.5 h-4.5" /> إجابة خاطئة
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    <b>التوجيه الشرعي:</b> {questions[currentQuestionIdx].explanation}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Submit / Next button */}
            {!isAnswerSubmitted ? (
              <Button 
                onClick={handleSubmitAnswer}
                isDisabled={!selectedOption}
                className="w-full h-12 bg-brand-gold-500 hover:bg-brand-gold-600 text-slate-950 font-black text-sm rounded-xl cursor-pointer"
              >
                تحقق من الإجابة
              </Button>
            ) : (
              <Button 
                onClick={handleNextQuestion}
                className="w-full h-12 bg-brand-emerald-500 hover:bg-brand-emerald-600 text-slate-950 font-black text-sm rounded-xl cursor-pointer flex items-center justify-center gap-1"
              >
                <span>{currentQuestionIdx === questions.length - 1 ? "إرسال وإنهاء التحدي" : "المسألة التالية"}</span>
                <ChevronLeft className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}

        {/* FLOW 3: RESULTS SUMMARY SCREEN */}
        {flowState === "results" && (
          <div className="space-y-6 max-w-md mx-auto">
            {submittingResult ? (
              <Card className="glass-panel border-slate-850 p-8 text-center space-y-4">
                <Loader2 className="w-10 h-10 text-brand-emerald-500 animate-spin mx-auto" />
                <p className="text-sm font-bold">جاري مراجعة إجاباتك فقهياً وحفظ سجل تقدمك...</p>
              </Card>
            ) : resultsOutcome ? (
              <Card className={`border p-6 text-center space-y-6 ${
                resultsOutcome.isPassed
                  ? "bg-brand-emerald-950/15 border-brand-emerald-800/30"
                  : "bg-slate-950/30 border-slate-850"
              }`}>
                
                {/* Result header icon */}
                <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center">
                  {resultsOutcome.isPassed ? (
                    <Sparkles className="w-12 h-12 text-brand-gold-500 animate-pulse" />
                  ) : (
                    <XCircle className="w-12 h-12 text-rose-500" />
                  )}
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl font-extrabold">
                    {resultsOutcome.isPassed ? "تهانينا! لقد أتقنت الدرس 🎉" : "تعثرت في محاولتك الحالية"}
                  </h2>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    لقد أحرزت نسبة إتقان <b className="text-slate-200">{resultsOutcome.scorePercentage}%</b> في إجابة المسائل الفقهية.
                  </p>
                </div>

                {/* Score card details */}
                <div className="grid grid-cols-2 gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-850 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-0.5">النقاط المكتسبة</span>
                    <span className="font-extrabold text-brand-emerald-400 text-base">+{resultsOutcome.xpGained} XP</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">الجواهر المكتسبة</span>
                    <span className="font-extrabold text-brand-gold-400 text-base">💎 +{resultsOutcome.gemsGained}</span>
                  </div>
                </div>

                {!resultsOutcome.isPassed && (
                  <div className="bg-rose-500/5 p-3 rounded-lg border border-rose-500/10 text-[10px] text-rose-400 text-right leading-relaxed">
                    💡 <b>تنبيه التحصيل المتباعد:</b> تم جدولة المفاهيم التي تعثرت فيها وإضافتها تلقائياً إلى <b>طابور المراجعة المتباعدة</b> لتظهر لك مجدداً بعد 24 ساعة للمراجعة والتمكين.
                  </div>
                )}

                {/* Final actions */}
                <div className="flex flex-col gap-2 pt-2">
                  {resultsOutcome.isPassed ? (
                    <Link 
                      href="/dashboard"
                      className="w-full bg-brand-emerald-500 hover:bg-brand-emerald-600 text-slate-950 font-black text-xs py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/15"
                    >
                      <Home className="w-4 h-4" />
                      <span>العودة للوحة التقدم</span>
                    </Link>
                  ) : (
                    <>
                      <Button 
                        onClick={handleRetryChallenge}
                        className="w-full bg-brand-gold-500 hover:bg-brand-gold-600 text-slate-950 font-black text-xs py-3 rounded-xl cursor-pointer flex items-center justify-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>أعد التحدي والمحاولة</span>
                      </Button>
                      <Link 
                        href="/dashboard"
                        className="w-full bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-300 font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2"
                      >
                        العودة للوحة التحكم
                      </Link>
                    </>
                  )}
                </div>

              </Card>
            ) : (
              <div className="text-center py-10 text-slate-500">حدث خطأ أثناء رفع النتائج.</div>
            )}
          </div>
        )}

      </div>

      {/* Fiqh Proof Modal */}
      {reference && (
        <Modal 
          isOpen={isSourceOpen} 
          onOpenChange={setIsSourceOpen}
        >
          <ModalDialog className="dark text-slate-100 bg-[#070d1e] border border-slate-800/80 rounded-2xl max-w-xl font-sans">
            <ModalHeader className="border-b border-slate-800/40 font-extrabold text-brand-emerald-400 flex items-center gap-1.5">
              <BookMarked className="w-5 h-5" /> بطاقة التوثيق الشرعي والدليل
            </ModalHeader>
            <ModalBody className="py-6 space-y-4">
              <div className="space-y-1.5 text-xs">
                <span className="text-[10px] font-bold text-brand-gold-500 uppercase tracking-wider">الكتاب المصدر:</span>
                <p className="font-bold text-slate-200">
                  {reference.sourceBook} - {reference.sourceSection} {reference.pageNumber && `(صفحة ${reference.pageNumber})`}
                </p>
                {reference.edition && <p className="text-[10px] text-slate-500">{reference.edition}</p>}
              </div>

              {reference.sourceText && (
                <div className="space-y-1.5 text-xs">
                  <span className="text-[10px] font-bold text-brand-gold-500 uppercase tracking-wider">النص المستدل به:</span>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-800/50 font-serif">
                    {reference.sourceText}
                  </p>
                </div>
              )}

              {reference.explanation && (
                <div className="space-y-1.5 text-xs">
                  <span className="text-[10px] font-bold text-brand-gold-500 uppercase tracking-wider">العلة وتوجيه الحكم المعتمد:</span>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {reference.explanation}
                  </p>
                </div>
              )}
            </ModalBody>
            <ModalFooter className="border-t border-slate-800/40">
              <Button 
                onClick={() => setIsSourceOpen(false)}
                className="bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-300 font-bold text-xs py-2 px-4 rounded-xl cursor-pointer"
              >
                إغلاق النافذة
              </Button>
            </ModalFooter>
          </ModalDialog>
        </Modal>
      )}

    </div>
  );
}
