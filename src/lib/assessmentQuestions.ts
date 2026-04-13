// Assessment questions configuration — 7 domains, 5 sub-traits each, 8-question banks
// 1 question randomly selected per sub-trait = 5 questions per domain = 35 total

export interface QuestionConfig {
  text: string;
  reversed?: boolean;
}

export interface SubTrait {
  name: string;
  questions: QuestionConfig[];
}

export interface DomainConfig {
  label: string;
  subTraits: SubTrait[];
}

// All 7 domains
export type DomainCode = "L" | "I" | "R" | "D" | "C" | "B" | "S";

export const DOMAIN_CONFIGS: Record<DomainCode, DomainConfig> = {
  L: {
    label: "Leadership DNA",
    subTraits: [
      {
        name: "Ownership",
        questions: [
          { text: "When something goes wrong, I look at what I could've done better first." },
          { text: "I step in to help even when it's not \"my job.\"" },
          { text: "I follow through on commitments, even when no one is checking." },
          { text: "If a team fails, I feel responsible for part of the outcome." },
          { text: "I prepare ahead of time instead of reacting last minute." },
          { text: "I hold myself to the same standards I expect from others." },
          { text: "I don't wait to be told what to do in group situations." },
          { text: "I stay disciplined even when I don't feel motivated." },
        ],
      },
      {
        name: "Communication",
        questions: [
          { text: "I say what needs to be said, even when it's uncomfortable." },
          { text: "I adjust how I speak depending on who I'm talking to." },
          { text: "I listen fully instead of thinking about what I'll say next." },
          { text: "I give feedback in a way that helps people improve." },
          { text: "I can clearly explain my thoughts under pressure." },
          { text: "I ask questions when I don't understand something." },
          { text: "I communicate differently in high-pressure vs normal situations." },
          { text: "I know when to speak up and when to stay quiet." },
        ],
      },
      {
        name: "Awareness",
        questions: [
          { text: "I notice how others are feeling without them saying it." },
          { text: "I'm aware of how my attitude affects the group." },
          { text: "I can tell when energy in a room shifts." },
          { text: "I reflect on my behavior after important situations." },
          { text: "I recognize when my emotions are impacting my decisions." },
          { text: "I pick up on things others overlook in group settings." },
          { text: "I understand how my actions are perceived by others." },
          { text: "I stay aware of both my role and others' roles in a team." },
        ],
      },
      {
        name: "Decision-Making",
        questions: [
          { text: "I stay calm when quick decisions are needed." },
          { text: "I adjust quickly when things don't go as planned." },
          { text: "I focus on solutions instead of problems." },
          { text: "I make decisions confidently without overthinking." },
          { text: "I can make good decisions even with limited information." },
          { text: "I don't panic when plans change unexpectedly." },
          { text: "I think through consequences before acting." },
          { text: "I stay composed in high-pressure moments." },
        ],
      },
      {
        name: "Influence",
        questions: [
          { text: "People naturally look to me for direction." },
          { text: "I lead by example more than by words." },
          { text: "I don't need recognition to take initiative." },
          { text: "I bring energy that motivates others." },
          { text: "I help others stay focused when things get difficult." },
          { text: "I build trust with teammates over time." },
          { text: "I positively impact the culture of the group." },
          { text: "I lead in a way that makes others better." },
        ],
      },
    ],
  },
  I: {
    label: "Identity & Values",
    subTraits: [
      {
        name: "Core Values Awareness",
        questions: [
          { text: "I do what I believe is right, even if it might cost me something." },
          { text: "I speak up when I disagree with something that feels wrong." },
          { text: "I tell the truth, even when it would be easier not to." },
          { text: "I can clearly explain what matters most to me." },
          { text: "I help my friends make better decisions, even if they don't like it." },
          { text: "I correct things when I get credit for something I didn't fully earn." },
          { text: "I stay true to what I believe, even when others don't." },
          { text: "My actions show what I stand for." },
        ],
      },
      {
        name: "Character vs Performance Identity",
        questions: [
          { text: "I don't let a bad performance define who I am." },
          { text: "I feel confident in who I am, even outside of sports or school." },
          { text: "When I get criticized, I don't take it as a personal attack." },
          { text: "I care more about how I act than just winning or succeeding." },
          { text: "I still feel good about myself even when no one notices my success." },
          { text: "Being a good teammate/person matters more to me than being the best." },
          { text: "When I make mistakes, I focus on improving—not putting myself down." },
          { text: "I believe who I am is bigger than what I achieve." },
        ],
      },
      {
        name: "Integrity & Alignment",
        questions: [
          { text: "I do the right thing even when no one is watching." },
          { text: "I don't follow others when I know something is wrong." },
          { text: "I treat people the same whether they are around or not." },
          { text: "I keep my promises, even when it's inconvenient." },
          { text: "I act the same way around different groups of people." },
          { text: "I choose what's right, even when it's harder." },
          { text: "I take responsibility when someone trusts me with something important." },
          { text: "I would feel comfortable if people saw how I act in private." },
        ],
      },
      {
        name: "Self-Concept",
        questions: [
          { text: "I know who I am beyond what I do (sports, school, etc.)." },
          { text: "I see myself as a leader, not just sometimes but consistently." },
          { text: "I stay confident in myself even when things go wrong." },
          { text: "I stay true to myself in new or different environments." },
          { text: "I define myself by my values, not just my actions." },
          { text: "I believe others would describe me the same way I describe myself." },
          { text: "I feel like I am becoming the person I want to be." },
          { text: "I have a clear idea of who I want to become." },
        ],
      },
      {
        name: "Purpose & Direction",
        questions: [
          { text: "I feel like I am working toward something important in my life." },
          { text: "I have a reason behind what I do each day." },
          { text: "I stay committed to my goals even when things get hard." },
          { text: "I think about the kind of person I want to become." },
          { text: "I try to set a good example for others." },
          { text: "My daily habits help me move toward my goals." },
          { text: "I make decisions based on my future, not just how I feel right now." },
          { text: "I would still have direction even if things didn't go my way." },
        ],
      },
    ],
  },
  R: {
    label: "Emotional Regulation",
    subTraits: [
      {
        name: "Emotional Awareness",
        questions: [
          { text: "I can tell when I'm getting frustrated before I act on it." },
          { text: "I notice when my mood starts to change during a game or school day." },
          { text: "I understand what I'm feeling, not just that I feel \"off.\"" },
          { text: "I can tell when stress is starting to affect me." },
          { text: "I notice how my emotions affect how I perform." },
          { text: "I can recognize when I'm getting too excited or too upset." },
          { text: "I know what usually triggers my frustration or stress." },
          { text: "I can tell the difference between being tired, stressed, or upset." },
        ],
      },
      {
        name: "Impulse Control",
        questions: [
          { text: "I pause before reacting when something makes me upset." },
          { text: "I stop myself from saying things I might regret." },
          { text: "I can stay in control even when I feel angry." },
          { text: "I don't let my emotions control my actions." },
          { text: "I think before I act in stressful situations." },
          { text: "I can hold back negative reactions when things don't go my way." },
          { text: "I stay disciplined even when I feel emotional." },
          { text: "I avoid making quick decisions when I'm frustrated." },
        ],
      },
      {
        name: "Composure Under Pressure",
        questions: [
          { text: "I stay calm during important moments (games, tests, etc.)." },
          { text: "I don't panic when things start going wrong." },
          { text: "I stay focused even when there is pressure on me." },
          { text: "I can handle stress without shutting down." },
          { text: "I stay steady even when others around me are losing control." },
          { text: "I don't let pressure make me rush or lose focus." },
          { text: "I can perform well even when I feel nervous." },
          { text: "I stay confident even in tough situations." },
        ],
      },
      {
        name: "Response vs Reaction",
        questions: [
          { text: "I choose how I respond instead of reacting automatically." },
          { text: "I think about the outcome before I respond to a situation." },
          { text: "I don't let one bad moment affect everything else." },
          { text: "I respond in ways that help the situation, not make it worse." },
          { text: "I stay positive even after mistakes." },
          { text: "I control my reactions instead of blaming others." },
          { text: "I respond differently depending on the situation." },
          { text: "I stay in control of myself even when things feel unfair." },
        ],
      },
      {
        name: "Recovery & Reset",
        questions: [
          { text: "I can bounce back quickly after a mistake." },
          { text: "I don't stay stuck on bad moments for too long." },
          { text: "I reset my mindset after something goes wrong." },
          { text: "I can move on and refocus quickly." },
          { text: "I don't let one bad play ruin the rest of my performance." },
          { text: "I learn from mistakes instead of dwelling on them." },
          { text: "I recover mentally faster than most people around me." },
          { text: "I can get back to my best quickly after being frustrated." },
        ],
      },
    ],
  },
  D: {
    label: "Discipline & Habits",
    subTraits: [
      {
        name: "Consistency",
        questions: [
          { text: "I show up ready even on days I don't feel like it." },
          { text: "I follow through on what I start." },
          { text: "I stick to routines even when things get busy." },
          { text: "I do the small things right every day." },
          { text: "I stay consistent even when no one is watching." },
          { text: "I don't let one bad day turn into multiple bad days." },
          { text: "I keep working toward my goals over time." },
          { text: "I build habits instead of relying on motivation." },
        ],
      },
      {
        name: "Self-Discipline",
        questions: [
          { text: "I do what I need to do before what I want to do." },
          { text: "I stay focused even when distractions are around." },
          { text: "I push myself even when I feel tired or unmotivated." },
          { text: "I avoid things that take me away from my goals." },
          { text: "I can control my habits (sleep, phone use, etc.)." },
          { text: "I finish tasks even when they are boring or hard." },
          { text: "I don't need someone to tell me to stay on track." },
          { text: "I stay disciplined even when no one checks on me." },
        ],
      },
      {
        name: "Focus & Time Management",
        questions: [
          { text: "I use my time wisely throughout the day." },
          { text: "I don't waste time on things that don't help me grow." },
          { text: "I can focus on one task without getting distracted." },
          { text: "I plan my day instead of just reacting to it." },
          { text: "I balance school, sports, and personal time well." },
          { text: "I stay focused during important tasks." },
          { text: "I limit distractions when I need to get something done." },
          { text: "I know how to prioritize what matters most." },
        ],
      },
      {
        name: "Work Ethic",
        questions: [
          { text: "I give full effort even when no one is watching." },
          { text: "I push myself to improve, not just to get by." },
          { text: "I go beyond what is expected of me." },
          { text: "I stay locked in during practice or work time." },
          { text: "I compete with myself to get better." },
          { text: "I don't quit when things get difficult." },
          { text: "I stay engaged instead of going through the motions." },
          { text: "I take pride in how hard I work." },
        ],
      },
      {
        name: "Accountability Systems",
        questions: [
          { text: "I reflect on what I did well and what I can improve." },
          { text: "I take responsibility for my results." },
          { text: "I track my progress toward my goals." },
          { text: "I learn from my mistakes and adjust." },
          { text: "I set goals and follow through on them." },
          { text: "I check myself when I start slipping off track." },
          { text: "I take ownership of my habits and routines." },
          { text: "I make changes when I know something isn't working." },
        ],
      },
    ],
  },
  C: {
    label: "Confidence",
    subTraits: [
      {
        name: "Self-Belief",
        questions: [
          { text: "I believe I can succeed even when things are difficult." },
          { text: "I trust my abilities when I step into competition or challenges." },
          { text: "I feel confident in what I bring to a team or group." },
          { text: "I believe I can improve and get better over time." },
          { text: "I don't compare myself too much to others." },
          { text: "I feel good about who I am as a person and athlete." },
          { text: "I believe I can handle challenges that come my way." },
          { text: "I see myself as someone who can achieve big goals." },
        ],
      },
      {
        name: "Confidence Under Pressure",
        questions: [
          { text: "I stay confident during important moments (games, tests, etc.)." },
          { text: "I trust myself when the pressure is high." },
          { text: "I don't doubt myself in big situations." },
          { text: "I stay mentally strong even when things aren't going well." },
          { text: "I believe in myself even when others doubt me." },
          { text: "I stay focused instead of nervous in pressure situations." },
          { text: "I perform with confidence even when I feel nervous." },
          { text: "I don't let pressure make me lose belief in myself." },
        ],
      },
      {
        name: "Resilience to Failure",
        questions: [
          { text: "I don't lose confidence after making mistakes." },
          { text: "I bounce back quickly after failure." },
          { text: "I don't let one bad moment affect how I see myself." },
          { text: "I use failure as motivation to improve." },
          { text: "I stay confident even when I'm not performing well." },
          { text: "I don't get stuck thinking about past mistakes." },
          { text: "I believe I can recover after setbacks." },
          { text: "I don't let failure define me." },
        ],
      },
      {
        name: "Preparation-Based Confidence",
        questions: [
          { text: "I feel more confident when I know I've prepared well." },
          { text: "I put in work so I can trust myself later." },
          { text: "My confidence comes from what I do, not just what I say." },
          { text: "I prepare even when I don't feel like it." },
          { text: "I trust my training and practice." },
          { text: "I feel ready because I've done the work." },
          { text: "I build confidence through consistent effort." },
          { text: "I rely on preparation when I feel unsure." },
        ],
      },
      {
        name: "Courage & Risk-Taking",
        questions: [
          { text: "I take action even when I feel nervous." },
          { text: "I'm willing to try things even if I might fail." },
          { text: "I step up in important moments instead of avoiding them." },
          { text: "I don't let fear stop me from competing or performing." },
          { text: "I take responsibility in big situations." },
          { text: "I put myself in positions to grow, even if it's uncomfortable." },
          { text: "I challenge myself instead of staying comfortable." },
          { text: "I go after opportunities instead of waiting for them." },
        ],
      },
    ],
  },
  B: {
    label: "Belonging & Impact",
    subTraits: [
      {
        name: "Connection",
        questions: [
          { text: "I make an effort to connect with different people on my team or group." },
          { text: "I include others who might feel left out." },
          { text: "I build positive relationships with teammates or classmates." },
          { text: "I try to get to know people beyond the surface." },
          { text: "I make others feel welcome around me." },
          { text: "I communicate in a way that brings people together." },
          { text: "I can build trust with others over time." },
          { text: "I try to be someone people feel comfortable around." },
        ],
      },
      {
        name: "Contribution",
        questions: [
          { text: "I look for ways to help my team or group succeed." },
          { text: "I do my part to make the group better." },
          { text: "I bring positive energy to the team." },
          { text: "I support others even when things aren't going well." },
          { text: "I take pride in contributing to something bigger than myself." },
          { text: "I step up when the team needs help." },
          { text: "I focus on helping the group, not just myself." },
          { text: "I do things that help the team succeed, even if they go unnoticed." },
        ],
      },
      {
        name: "Empathy",
        questions: [
          { text: "I try to understand how others are feeling." },
          { text: "I support teammates when they are struggling." },
          { text: "I listen to others instead of just focusing on myself." },
          { text: "I can tell when someone needs encouragement." },
          { text: "I care about how my actions affect others." },
          { text: "I respond to others with respect, even when I disagree." },
          { text: "I try to see situations from other people's perspectives." },
          { text: "I help others feel valued and respected." },
        ],
      },
      {
        name: "Influence on Culture",
        questions: [
          { text: "I help create a positive environment around me." },
          { text: "I hold others to a high standard in a positive way." },
          { text: "I encourage others to do their best." },
          { text: "I bring energy that lifts the group." },
          { text: "I influence others to make better choices." },
          { text: "I help keep the team focused and motivated." },
          { text: "I set an example through my actions." },
          { text: "I make the group better when I'm part of it." },
        ],
      },
      {
        name: "Purpose & Legacy",
        questions: [
          { text: "I think about the impact I have on others." },
          { text: "I want to leave a positive mark on my team or group." },
          { text: "I care about being remembered for more than performance." },
          { text: "I think about how I can help others grow." },
          { text: "I want to be someone others can look up to." },
          { text: "I believe my actions can influence others in a positive way." },
          { text: "I think beyond myself when making decisions." },
          { text: "I care about what I leave behind as a person." },
        ],
      },
    ],
  },
  S: {
    label: "Resilience",
    subTraits: [
      {
        name: "Bounce Back Ability",
        questions: [
          { text: "I recover quickly after making a mistake." },
          { text: "I don't let failure affect me for too long." },
          { text: "I can reset my mindset after something goes wrong." },
          { text: "I move on quickly after a bad performance." },
          { text: "I don't stay stuck thinking about mistakes." },
          { text: "I get back to focusing after setbacks." },
          { text: "I bounce back faster than most people around me." },
          { text: "I can let go of bad moments and keep going." },
        ],
      },
      {
        name: "Persistence",
        questions: [
          { text: "I keep going even when things get difficult." },
          { text: "I don't quit when things aren't going my way." },
          { text: "I stay committed to my goals through challenges." },
          { text: "I push through when I feel tired or discouraged." },
          { text: "I stay focused even when progress is slow." },
          { text: "I don't give up easily." },
          { text: "I keep working even when results don't come right away." },
          { text: "I stay consistent during tough times." },
        ],
      },
      {
        name: "Adaptability",
        questions: [
          { text: "I adjust when plans don't go the way I expected." },
          { text: "I stay flexible when situations change." },
          { text: "I can handle unexpected challenges without getting overwhelmed." },
          { text: "I find new ways to solve problems when needed." },
          { text: "I stay open to change instead of resisting it." },
          { text: "I adjust my approach when something isn't working." },
          { text: "I stay focused even when things don't go as planned." },
          { text: "I can stay positive when things change suddenly." },
        ],
      },
      {
        name: "Growth Mindset",
        questions: [
          { text: "I learn from my mistakes instead of ignoring them." },
          { text: "I see challenges as chances to improve." },
          { text: "I believe I can grow through effort and practice." },
          { text: "I take feedback as a way to get better." },
          { text: "I look for lessons in difficult situations." },
          { text: "I don't let failure stop me from trying again." },
          { text: "I focus on improving, not just winning." },
          { text: "I believe setbacks help me grow." },
        ],
      },
      {
        name: "Mental Toughness",
        questions: [
          { text: "I stay strong during long periods of difficulty." },
          { text: "I don't let frustration break my focus." },
          { text: "I handle pressure over time without giving up." },
          { text: "I stay mentally locked in during challenges." },
          { text: "I don't let tough situations change my mindset." },
          { text: "I stay determined even when things feel overwhelming." },
          { text: "I can handle stress for long periods of time." },
          { text: "I stay committed even when things feel very hard." },
        ],
      },
    ],
  },
};

// All domain codes in display order
export const DOMAIN_CODES: DomainCode[] = ["L", "I", "R", "D", "C", "B", "S"];

// Seeded random for consistent question selection per session
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Select 1 random question per sub-trait for all domains.
 * Uses a session seed so the same questions are shown throughout a single assessment attempt.
 */
export function selectRandomQuestions(sessionSeed?: number): Record<DomainCode, QuestionConfig[]> {
  const seed = sessionSeed ?? Date.now();
  const rng = seededRandom(seed);

  const result = {} as Record<DomainCode, QuestionConfig[]>;
  for (const code of DOMAIN_CODES) {
    const domain = DOMAIN_CONFIGS[code];
    result[code] = domain.subTraits.map((st) => {
      const idx = Math.floor(rng() * st.questions.length);
      return st.questions[idx];
    });
  }
  return result;
}

// Legacy compatibility wrapper (used by DomainSection)
export interface DomainQuestions {
  L: QuestionConfig[];
  I: QuestionConfig[];
  R: QuestionConfig[];
  D: QuestionConfig[];
  C: QuestionConfig[];
  B: QuestionConfig[];
  S: QuestionConfig[];
}

// No longer age-based — universal question bank
export const getQuestionsForAge = (_age: number | null): DomainQuestions => {
  // This is now a thin wrapper; actual randomisation happens via selectRandomQuestions
  // Return first question from each sub-trait as default (non-random) fallback
  const result = {} as DomainQuestions;
  for (const code of DOMAIN_CODES) {
    const domain = DOMAIN_CONFIGS[code];
    result[code] = domain.subTraits.map((st) => st.questions[0]);
  }
  return result;
};

export const getDomainLabel = (domain: DomainCode): string => {
  return DOMAIN_CONFIGS[domain]?.label ?? domain;
};
