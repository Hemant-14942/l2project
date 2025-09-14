import React, { useState } from "react";
import ReadingTest from "../components/ReadingTest"
import ADHDTest2 from "../components/ADHDTest2";
import JumbledSentenceTest from "../components/JumbledSentenceTest";
import WrongWordDetectTest from "../components/WrongWordDetectTest";
import FinalResult from "../components/FinalResult";

const TestSequence = () => {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState({
    reading: null,
    adhd: null,
    jumbled: null,
    wrongword: null,
  });

  const handleNext = (testName, score) => {
    setScores((prev) => ({ ...prev, [testName]: score }));
    setStep((prev) => prev + 1);
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return <ReadingTest onComplete={(score) => handleNext("reading", score)} />;
      case 1:
        return <ADHDTest2 onComplete={(score) => handleNext("adhd", score)} />;
      case 2:
        return <JumbledSentenceTest onComplete={(score) => handleNext("jumbled", score)} />;
      case 3:
        return <WrongWordDetectTest onComplete={(score) => handleNext("wrongword", score)} />;
      case 4:
        return <FinalResult scores={scores} />;
      default:
        return <div>Unknown step</div>;
    }
  };

  return <div>{renderStep()}</div>;
};

export default TestSequence;
