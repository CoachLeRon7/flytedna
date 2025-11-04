// Assessment questions configuration based on age groups

export interface QuestionConfig {
  text: string;
  reversed?: boolean; // For reverse-scored items
}

export interface DomainQuestions {
  L: QuestionConfig[];
  E: QuestionConfig[];
  A: QuestionConfig[];
  D: QuestionConfig[];
  B: QuestionConfig[];
}

// Original questions for ages 19+ (Transformational Leadership)
export const TRANSFORMATIONAL_QUESTIONS: DomainQuestions = {
  L: [
    { text: "I am willing to risk being misunderstood if it means standing for what's right" },
    { text: "I can identify the values that guide my decisions, even under pressure" },
    { text: "I am aware of how my tone and body language affect my influence" },
    { text: "I seek truth from people who challenge my perspective, not just those who affirm it" },
    { text: "I lead with empathy, not ego" },
    { text: "I can admit when my presence is part of the problem, not just the solution" },
  ],
  E: [
    { text: "I evaluate success by how well I executed my process, not just the outcome" },
    { text: "I study my mistakes with curiosity, not shame" },
    { text: "I know how to reset my focus after a personal or team failure" },
    { text: "I consistently hold myself to higher standards than others expect of me" },
    { text: "I prioritize consistency over intensity when pursuing growth" },
    { text: "I create environments where others feel safe to strive for excellence" },
  ],
  A: [
    { text: "I take initiative to repair relationships when I've hurt trust" },
    { text: "I don't excuse my behavior based on how others treated me first" },
    { text: "I respond to failure with action, not explanation" },
    { text: "I deliver on commitments even when motivation fades or credit won't be given" },
    { text: "I hold teammates accountable with respect, not control" },
    { text: "I consistently align my intentions with my actions" },
  ],
  D: [
    { text: "I do what's necessary even when it's uncomfortable or unseen" },
    { text: "I can delay short-term pleasure for long-term purpose" },
    { text: "I train my mindset daily as intentionally as I train my body" },
    { text: "I protect my time and energy from distractions that compromise my goals" },
    { text: "I can stay composed and effective when plans fall apart" },
    { text: "My habits reflect who I say I want to become" },
  ],
  B: [
    { text: "I intentionally build bridges with people who are different from me" },
    { text: "I recognize when my leadership unintentionally excludes or overshadows others" },
    { text: "I use my influence to amplify those who often go unnoticed" },
    { text: "I think beyond my sport — how I lead in my community, family, and future" },
    { text: "I mentor others without expecting anything in return" },
    { text: "I want to be remembered for how I made people feel, not just what I achieved" },
  ],
};

// Foundational questions for ages 12-16
export const FOUNDATIONAL_QUESTIONS: DomainQuestions = {
  A: [
    { text: "I show up prepared and on time" },
    { text: "I finish the reps and sets I'm assigned" },
    { text: "I make excuses when I don't meet a standard", reversed: true },
    { text: "I keep my word even when it's hard" },
  ],
  E: [
    { text: "I apply feedback the next time I train or compete" },
    { text: "I practice skills I'm not good at yet" },
    { text: "I shut down when I'm corrected", reversed: true },
    { text: "I look for small ways to improve every week" },
  ],
  L: [
    { text: "I encourage teammates when they struggle" },
    { text: "I help set a focused tone during practice" },
    { text: "I let negative talk slide without speaking up", reversed: true },
    { text: "I communicate clearly—before, during, and after drills" },
  ],
  D: [
    { text: "I reset quickly after a mistake" },
    { text: "I compete with the same effort whether winning or losing" },
    { text: "I let frustration control my actions", reversed: true },
    { text: "I stay composed in pressure moments" },
  ],
  B: [
    { text: "I do the right thing when no one is watching" },
    { text: "I respect coaches, officials, and opponents" },
    { text: "I cut corners if I think I won't get caught", reversed: true },
    { text: "I own my results—good or bad" },
  ],
};

// Emerging questions for ages 17-19 (mixture of foundational and transformational)
export const EMERGING_QUESTIONS: DomainQuestions = {
  L: [
    // 3 foundational + 3 transformational
    { text: "I encourage teammates when they struggle" },
    { text: "I communicate clearly—before, during, and after drills" },
    { text: "I let negative talk slide without speaking up", reversed: true },
    { text: "I am aware of how my tone and body language affect my influence" },
    { text: "I seek truth from people who challenge my perspective, not just those who affirm it" },
    { text: "I lead with empathy, not ego" },
  ],
  E: [
    { text: "I apply feedback the next time I train or compete" },
    { text: "I practice skills I'm not good at yet" },
    { text: "I look for small ways to improve every week" },
    { text: "I study my mistakes with curiosity, not shame" },
    { text: "I consistently hold myself to higher standards than others expect of me" },
    { text: "I prioritize consistency over intensity when pursuing growth" },
  ],
  A: [
    { text: "I show up prepared and on time" },
    { text: "I keep my word even when it's hard" },
    { text: "I make excuses when I don't meet a standard", reversed: true },
    { text: "I take initiative to repair relationships when I've hurt trust" },
    { text: "I respond to failure with action, not explanation" },
    { text: "I deliver on commitments even when motivation fades or credit won't be given" },
  ],
  D: [
    { text: "I reset quickly after a mistake" },
    { text: "I stay composed in pressure moments" },
    { text: "I let frustration control my actions", reversed: true },
    { text: "I do what's necessary even when it's uncomfortable or unseen" },
    { text: "I can delay short-term pleasure for long-term purpose" },
    { text: "I protect my time and energy from distractions that compromise my goals" },
  ],
  B: [
    { text: "I do the right thing when no one is watching" },
    { text: "I respect coaches, officials, and opponents" },
    { text: "I own my results—good or bad" },
    { text: "I intentionally build bridges with people who are different from me" },
    { text: "I use my influence to amplify those who often go unnoticed" },
    { text: "I want to be remembered for how I made people feel, not just what I achieved" },
  ],
};

// Get appropriate questions based on age
export const getQuestionsForAge = (age: number | null): DomainQuestions => {
  if (age === null || age >= 19) {
    return TRANSFORMATIONAL_QUESTIONS;
  } else if (age >= 17) {
    return EMERGING_QUESTIONS;
  } else {
    return FOUNDATIONAL_QUESTIONS;
  }
};

// Get domain label based on age
export const getDomainLabel = (domain: keyof DomainQuestions): string => {
  const labels = {
    L: "Leadership DNA",
    E: "Excellence",
    A: "Accountability",
    D: "Discipline",
    B: "Belonging & Impact",
  };
  return labels[domain];
};
