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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070d1f]/90 backdrop-blur-sm"
    >
      <div className="w-full max-w-[560px] bg-surface border border-border rounded-card shadow-2xl flex flex-col overflow-hidden">
        {/* Header Bar */}
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-mini font-mono uppercase tracking-wider text-muted-2">
              {activeQuizSkill.name} · question {Math.min(currentQuestionIndex + 1, totalQuestions)} of {totalQuestions}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-mini font-mono text-text">
              score {correctAnswersCount}/{currentQuestionIndex + (hasSubmittedAnswer ? 1 : 0)} ·{' '}
              <span className={secondsRemaining < 30 ? 'text-warning font-semibold' : 'text-text'}>
                {formattedTime}
              </span>
            </span>
            <button
              type="button"
              onClick={closeSkillQuiz}
              aria-label="Close quiz"
              className="w-8 h-8 flex items-center justify-center text-muted hover:text-text rounded-btn"
            >
              <CloseIcon size={16} />
            </button>
          </div>
        </div>

        {/* 3px Progress Bar */}
        <div className="w-full h-[3px] bg-sidebar">
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 space-y-5">
          {!isCompleted ? (
            <>
              <div>
                <h3 id="quiz-modal-title" className="text-[16px] font-medium text-text leading-snug">
                  {currentQ.question}
                </h3>
              </div>

              {/* 4 Options */}
              <div className="space-y-2.5">
                {currentQ.options.map((option, idx) => {
                  const isSelected = selectedOptionIndex === idx;
                  const isCorrect = idx === currentQ.correctIndex;

                  let borderClass = 'border-border hover:border-border-strong bg-sidebar';
                  let textClass = 'text-text-2';

                  if (hasSubmittedAnswer) {
                    if (isCorrect) {
                      borderClass = 'border-accent bg-accent/10';
                      textClass = 'text-text font-medium';
                    } else if (isSelected && !isCorrect) {
                      borderClass = 'border-warning bg-warning/10';
                      textClass = 'text-warning-text';
                    }
                  } else if (isSelected) {
                    borderClass = 'border-accent bg-accent/10';
                    textClass = 'text-text font-medium';
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectOption(idx)}
                      disabled={hasSubmittedAnswer}
                      className={`
                        w-full min-h-[44px] px-3.5 py-2.5 rounded-btn border text-left text-[13px] flex items-center justify-between gap-3 transition-colors
                        ${borderClass} ${textClass}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full border border-border flex items-center justify-center text-mini font-mono text-muted flex-shrink-0">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{option}</span>
                      </div>
                      {hasSubmittedAnswer && isCorrect && (
                        <CheckIcon size={14} className="text-accent flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Feedback explanation if answered */}
              {hasSubmittedAnswer && (
                <div className="p-3 rounded bg-sidebar border border-border text-[12px] font-mono text-muted">
                  <div className="text-accent font-semibold mb-1">
                    {selectedOptionIndex === currentQ.correctIndex ? '✓ Correct' : '✗ Incorrect'}
                  </div>
                  {currentQ.explanation}
                </div>
              )}

              {/* Modal Navigation Buttons */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <span className="text-mini font-mono text-muted-2">
                  Pass with 70% or more to earn the Verified Skill badge and update your CV.
                </span>

                {!hasSubmittedAnswer ? (
                  <button
                    type="button"
                    onClick={handleConfirmAnswer}
                    disabled={selectedOptionIndex === null}
                    className={`
                      h-10 px-5 rounded-btn text-[13px] font-medium transition-colors flex-shrink-0 border
                      ${
                        selectedOptionIndex !== null
                          ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700/80 hover:border-zinc-500 text-zinc-100 shadow-sm'
                          : 'bg-zinc-900/40 border-zinc-800 text-zinc-600 cursor-not-allowed'
                      }
                    `}
                  >
                    Submit Answer
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="h-10 px-5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 hover:border-zinc-500 text-zinc-100 rounded-btn text-[13px] font-medium transition-colors flex-shrink-0 shadow-sm"
                  >
                    {currentQuestionIndex < totalQuestions - 1 ? 'Next Question' : 'View Results'}
                  </button>
                )}
              </div>
            </>
          ) : (
            /* Completed Screen */
            <div className="py-4 text-center space-y-4">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-surface border border-border-strong mx-auto">
                {passed ? (
                  <CheckIcon size={24} className="text-accent" />
                ) : (
                  <AlertTriangleIcon size={24} className="text-warning" />
                )}
              </div>

              <div>
                <h4 className="text-pageTitle text-text font-semibold">
                  {passed ? 'Skill Verification Successful' : 'Verification Incomplete'}
                </h4>
                <div className="text-[28px] font-mono font-bold text-text mt-1">
                  {finalScore}%
                </div>
                <p className="text-[13px] text-muted max-w-sm mx-auto mt-2">
                  {passed
                    ? `${userProfile.name || 'Candidate'} demonstrated proficiency in ${activeQuizSkill.name}. The verified badge will be added to your profile and CV.`
                    : `Score below the required 70% benchmark (${correctAnswersCount}/${totalQuestions} correct). Review recommended documentation and retry.`}
                </p>
              </div>

              {passed && (
                <div className="p-3 bg-accent/10 border border-accent-border rounded inline-block text-mini font-mono text-accent">
                  ✓ VERIFIED SKILL BADGE ISSUED · ATS SCORE +6%
                </div>
              )}

              <div className="pt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={closeSkillQuiz}
                  className="h-10 px-5 rounded-btn border border-zinc-700/80 bg-zinc-900/70 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 text-[13px] font-medium transition-colors"
                >
                  Close
                </button>
                {passed ? (
                  <button
                    type="button"
                    onClick={handleApplyVerification}
                    className="h-10 px-5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 hover:border-zinc-500 text-zinc-100 rounded-btn text-[13px] font-medium font-mono transition-colors shadow-sm"
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
                    className="h-10 px-5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 hover:border-zinc-500 text-zinc-100 rounded-btn text-[13px] font-medium transition-colors shadow-sm"
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

