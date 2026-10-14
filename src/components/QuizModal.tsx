import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CloseIcon, CheckIcon, AlertTriangleIcon } from './Icons';

export const QuizModal: React.FC = () => {
  const { activeQuizSkill, closeSkillQuiz, verifySkill, userProfile } = useApp();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(150); // 2:30 timer
  const [hasSubmittedAnswer, setHasSubmittedAnswer] = useState(false);

  useEffect(() => {
    if (!activeQuizSkill) return;
    setCurrentQuestionIndex(0);
    setSelectedOptionIndex(null);
    setCorrectAnswersCount(0);
    setIsCompleted(false);
    setSecondsRemaining(150);
    setHasSubmittedAnswer(false);
  }, [activeQuizSkill]);

  // Timer countdown
  useEffect(() => {
    if (!activeQuizSkill || isCompleted) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsCompleted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeQuizSkill, isCompleted]);

  if (!activeQuizSkill) return null;

  const questions = activeQuizSkill.quizQuestions;
  const currentQ = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const progressPercent = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const handleSelectOption = (index: number) => {
    if (hasSubmittedAnswer) return;
    setSelectedOptionIndex(index);
  };

  const handleConfirmAnswer = () => {
    if (selectedOptionIndex === null) return;
    setHasSubmittedAnswer(true);
    if (selectedOptionIndex === currentQ.correctIndex) {
      setCorrectAnswersCount((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOptionIndex(null);
      setHasSubmittedAnswer(false);
    } else {
      setIsCompleted(true);
    }
  };

  const finalScore = Math.round((correctAnswersCount / totalQuestions) * 100);
  const passed = finalScore >= 70;

  const handleApplyVerification = () => {
    verifySkill(activeQuizSkill.id, finalScore);
    closeSkillQuiz();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quiz-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md"
    >
      <div className="w-full max-w-[560px] bg-gradient-to-br from-[#EDF7F6] via-[#F3F6FF] to-[#E8F4F8] border border-teal-300/60 rounded-card shadow-2xl flex flex-col overflow-hidden text-slate-900">
        {/* Header Bar */}
        <div className="px-5 py-3.5 border-b border-teal-200/60 flex items-center justify-between bg-teal-50/70">
          <div className="flex items-center gap-2">
            <span className="text-mini font-mono uppercase tracking-wider text-teal-900 font-bold">
              {activeQuizSkill.name} · question {Math.min(currentQuestionIndex + 1, totalQuestions)} of {totalQuestions}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-mini font-mono text-slate-700 font-medium">
              score {correctAnswersCount}/{currentQuestionIndex + (hasSubmittedAnswer ? 1 : 0)} ·{' '}
              <span className={secondsRemaining < 30 ? 'text-amber-700 font-bold' : 'text-indigo-950 font-bold'}>
                {formattedTime}
              </span>
            </span>
            <button
              type="button"
              onClick={closeSkillQuiz}
              aria-label="Close quiz"
              className="w-8 h-8 flex items-center justify-center text-teal-800 hover:text-indigo-950 hover:bg-teal-100/60 rounded-btn cursor-pointer transition-colors"
            >
              <CloseIcon size={16} />
            </button>
          </div>
        </div>

        {/* 3px Progress Bar */}
        <div className="w-full h-[3px] bg-teal-100/60">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 space-y-5">
          {!isCompleted ? (
            <>
              <div>
                <h3 id="quiz-modal-title" className="text-[17px] font-bold text-indigo-950 leading-snug">
                  {currentQ.question}
                </h3>
              </div>

              {/* 4 Options */}
              <div className="space-y-2.5">
                {currentQ.options.map((option, idx) => {
                  const isSelected = selectedOptionIndex === idx;
                  const isCorrect = idx === currentQ.correctIndex;

                  let borderClass = 'border-teal-200/80 hover:border-teal-400 bg-white/90';
                  let textClass = 'text-slate-800';

                  if (hasSubmittedAnswer) {
                    if (isCorrect) {
                      borderClass = 'border-emerald-500 bg-emerald-50 shadow-2xs';
                      textClass = 'text-emerald-950 font-bold';
                    } else if (isSelected && !isCorrect) {
                      borderClass = 'border-rose-300 bg-rose-50';
                      textClass = 'text-rose-900';
                    }
                  } else if (isSelected) {
                    borderClass = 'border-teal-500 bg-emerald-50 shadow-2xs';
                    textClass = 'text-indigo-950 font-bold';
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectOption(idx)}
                      disabled={hasSubmittedAnswer}
                      className={`
                        w-full min-h-[44px] px-3.5 py-2.5 rounded-btn border text-left text-[13px] flex items-center justify-between gap-3 transition-colors cursor-pointer
                        ${borderClass} ${textClass}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full border border-teal-200 flex items-center justify-center text-mini font-mono text-teal-800 font-bold flex-shrink-0 bg-teal-50">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{option}</span>
                      </div>
                      {hasSubmittedAnswer && isCorrect && (
                        <CheckIcon size={14} className="text-emerald-600 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Feedback explanation if answered */}
              {hasSubmittedAnswer && (
                <div className="p-3 rounded-btn bg-white/90 border border-teal-200/80 text-[12px] font-mono text-slate-700 shadow-2xs">
                  <div className={`font-bold mb-1 ${selectedOptionIndex === currentQ.correctIndex ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {selectedOptionIndex === currentQ.correctIndex ? '✓ Correct' : '✗ Incorrect'}
                  </div>
                  {currentQ.explanation}
                </div>
              )}

              {/* Modal Navigation Buttons */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <span className="text-mini font-mono text-slate-600">
                  Pass with 70% or more to earn the Verified Skill badge and update your CV.
                </span>

                {!hasSubmittedAnswer ? (
                  <button
                    type="button"
                    onClick={handleConfirmAnswer}
                    disabled={selectedOptionIndex === null}
                    className={`
                      h-10 px-5 rounded-btn text-[13px] font-bold transition-all flex-shrink-0 border shadow-xs
                      ${
                        selectedOptionIndex !== null
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 border-transparent text-white cursor-pointer'
                          : 'bg-white/60 border-teal-200/60 text-slate-400 opacity-60 cursor-not-allowed'
                      }
                    `}
                  >
                    Submit Answer
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="h-10 px-5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-btn text-[13px] font-bold transition-all flex-shrink-0 shadow-xs cursor-pointer"
                  >
                    {currentQuestionIndex < totalQuestions - 1 ? 'Next Question' : 'View Results'}
                  </button>
                )}
              </div>
            </>
          ) : (
            /* Completed Screen */
            <div className="py-4 text-center space-y-4">
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full border mx-auto shadow-sm ${passed ? 'bg-gradient-to-br from-emerald-50 to-teal-100 border-emerald-300' : 'bg-gradient-to-br from-amber-50 to-orange-100 border-amber-300'}`}>
                {passed ? (
                  <CheckIcon size={24} className="text-emerald-700" />
                ) : (
                  <AlertTriangleIcon size={24} className="text-amber-700" />
                )}
              </div>

              <div>
                <h4 className="text-pageTitle text-indigo-950 font-bold">
                  {passed ? 'Skill Verification Successful' : 'Verification Incomplete'}
                </h4>
                <div className="text-[32px] font-mono font-black text-indigo-950 mt-1">
                  {finalScore}%
                </div>
                <p className="text-[13px] text-slate-600 max-w-sm mx-auto mt-2 leading-relaxed font-medium">
                  {passed
                    ? `${userProfile.name || 'Candidate'} demonstrated proficiency in ${activeQuizSkill.name}. The verified badge will be added to your profile and CV.`
                    : `Score below the required 70% benchmark (${correctAnswersCount}/${totalQuestions} correct). Review recommended documentation and retry.`}
                </p>
              </div>

              {passed && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-400/40 rounded-btn inline-block text-mini font-mono text-emerald-900 font-bold shadow-2xs">
                  ✓ VERIFIED SKILL BADGE ISSUED · ATS SCORE +6%
                </div>
              )}

              <div className="pt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={closeSkillQuiz}
                  className="h-10 px-5 rounded-btn border border-teal-300/80 bg-white/90 hover:bg-white text-teal-900 text-[13px] font-bold transition-colors shadow-2xs cursor-pointer"
                >
                  Close
                </button>
                {passed ? (
                  <button
                    type="button"
                    onClick={handleApplyVerification}
                    className="h-10 px-5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-btn text-[13px] font-bold font-mono transition-all shadow-xs cursor-pointer"
                  >
                    Apply & Update CV.pdf
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentQuestionIndex(0);
                      setSelectedOptionIndex(null);
                      setCorrectAnswersCount(0);
                      setIsCompleted(false);
                      setSecondsRemaining(150);
                      setHasSubmittedAnswer(false);
                    }}
                    className="h-10 px-5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-btn text-[13px] font-bold transition-all shadow-xs cursor-pointer"
                  >
                    Retry Quiz
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

