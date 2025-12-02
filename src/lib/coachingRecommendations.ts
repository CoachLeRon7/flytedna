// Coaching recommendations for each assessment question

export interface CoachingTip {
  questionKey: string;
  domain: string;
  coachingFocus: string;
  whatItLooksLike: string;
  actionSteps: string[];
  conversationStarters: string[];
}

// Question keys format: L1-L6, E1-E6, A1-A6, D1-D6, B1-B6

export const COACHING_TIPS: Record<string, CoachingTip> = {
  // Leadership DNA - Foundational (ages 12-16)
  "L1_foundational": {
    questionKey: "L1",
    domain: "Leadership DNA",
    coachingFocus: "Building encouragement habits and peer support",
    whatItLooksLike: "Athlete notices when teammates are struggling and offers specific words of support. They celebrate small wins and help others stay motivated.",
    actionSteps: [
      "Assign as a 'buddy' to a newer or struggling teammate for one week",
      "Practice giving one specific encouragement per practice",
      "Role-play scenarios where they can uplift teammates"
    ],
    conversationStarters: [
      "Tell me about a time someone's encouragement helped you push through something hard.",
      "Who on the team needs encouragement right now? How could you help?",
      "What would it sound like if you encouraged [teammate] before their next rep?"
    ]
  },
  "L2_foundational": {
    questionKey: "L2",
    domain: "Leadership DNA",
    coachingFocus: "Setting the tone and creating focus in team settings",
    whatItLooksLike: "Athlete helps redirect energy when the team gets off track. They model engaged body language and bring energy to drills.",
    actionSteps: [
      "Give them responsibility to lead warm-up or a drill segment",
      "Ask them to notice when energy drops and try one intervention",
      "Have them share what 'focused tone' looks like to them"
    ],
    conversationStarters: [
      "What does a focused practice feel like to you?",
      "When have you seen someone else set a great tone? What did they do?",
      "How could you help the team refocus when things get chaotic?"
    ]
  },
  "L3_foundational": {
    questionKey: "L3",
    domain: "Leadership DNA",
    coachingFocus: "Speaking up against negativity (reverse-scored)",
    whatItLooksLike: "Athlete recognizes when negative talk is happening and finds age-appropriate ways to redirect it, either by changing the subject or addressing it directly.",
    actionSteps: [
      "Practice one phrase they can use when negativity arises",
      "Role-play how to redirect without being preachy",
      "Celebrate when they speak up, even if it's imperfect"
    ],
    conversationStarters: [
      "What makes it hard to speak up when you hear negative talk?",
      "What's one thing you could say if someone starts complaining?",
      "How do you want the team to feel after practice?"
    ]
  },
  "L4_foundational": {
    questionKey: "L4",
    domain: "Leadership DNA",
    coachingFocus: "Clear communication in all phases of training",
    whatItLooksLike: "Athlete verbalizes expectations before drills, gives feedback during reps, and debriefs what went well/what to adjust after.",
    actionSteps: [
      "Practice the 'Before-During-After' communication loop in one drill",
      "Ask them to verbalize their thinking out loud during a rep",
      "Give feedback on clarity: 'That was specific' or 'Try being more direct'"
    ],
    conversationStarters: [
      "What information do teammates need from you before the drill starts?",
      "How do you let someone know they did something well in the moment?",
      "After a drill, what's one thing you'd want to tell the team?"
    ]
  },

  // Leadership DNA - Transformational (ages 19+)
  "L1_transformational": {
    questionKey: "L1",
    domain: "Leadership DNA",
    coachingFocus: "Moral courage and standing for what's right",
    whatItLooksLike: "Athlete is willing to take an unpopular stance when their values are at stake, even if it means being misunderstood or facing pushback.",
    actionSteps: [
      "Reflect on a time they stayed silent when they should have spoken up",
      "Identify one core value they're willing to be 'misunderstood' for",
      "Practice articulating their values clearly and respectfully under pressure"
    ],
    conversationStarters: [
      "Tell me about a time when doing the right thing cost you something.",
      "What value matters so much to you that you'd risk being misunderstood?",
      "How do you stay grounded when others don't see it your way?"
    ]
  },
  "L2_transformational": {
    questionKey: "L2",
    domain: "Leadership DNA",
    coachingFocus: "Self-awareness and values clarity",
    whatItLooksLike: "Athlete can name their core values and trace how those values influence their decisions, especially under stress.",
    actionSteps: [
      "Write down 3-5 core values and recent examples of each in action",
      "Reflect on a recent decision and identify which value drove it",
      "Test values clarity by asking: 'Would I make this choice if no one was watching?'"
    ],
    conversationStarters: [
      "What are the 3 values you'd want people to say about you at the end of your career?",
      "When was the last time you made a hard choice based on your values?",
      "How do your values show up when you're under pressure?"
    ]
  },
  "L3_transformational": {
    questionKey: "L3",
    domain: "Leadership DNA",
    coachingFocus: "Non-verbal communication and self-awareness",
    whatItLooksLike: "Athlete recognizes how their tone, facial expressions, and body language affect team dynamics—and adjusts intentionally.",
    actionSteps: [
      "Film them in a practice setting and review their non-verbal cues together",
      "Ask teammates for feedback on how their tone impacts the room",
      "Practice matching their non-verbals to the message they want to send"
    ],
    conversationStarters: [
      "What does your body language say when you're frustrated?",
      "How do you think your tone lands with teammates right now?",
      "What would it look like if your presence made others feel more confident?"
    ]
  },
  "L4_transformational": {
    questionKey: "L4",
    domain: "Leadership DNA",
    coachingFocus: "Seeking truth over affirmation",
    whatItLooksLike: "Athlete actively seeks out dissenting opinions and feedback from people who challenge their thinking, not just those who agree.",
    actionSteps: [
      "Identify one person whose perspective they often dismiss—and ask them a question",
      "Practice saying 'Tell me more' or 'Help me see it differently'",
      "Reflect: Who in their life tells them hard truths? Thank them."
    ],
    conversationStarters: [
      "Who in your life challenges you the most? What do they help you see?",
      "When was the last time you asked for feedback from someone who'd be honest?",
      "What makes it hard to hear truth from people who don't affirm you?"
    ]
  },
  "L5_transformational": {
    questionKey: "L5",
    domain: "Leadership DNA",
    coachingFocus: "Leading with empathy, not ego",
    whatItLooksLike: "Athlete leads from a place of understanding and connection, not a need to be right, impressive, or in control.",
    actionSteps: [
      "Before reacting to conflict, pause and ask: 'What might they be feeling?'",
      "Practice leading a conversation where they ask more questions than give answers",
      "Reflect on recent leadership moments: Was it empathy or ego driving them?"
    ],
    conversationStarters: [
      "Tell me about a time you led with ego instead of empathy. What happened?",
      "How do you know when you're leading to help vs. leading to be seen?",
      "What would it look like to lead this team with more curiosity?"
    ]
  },
  "L6_transformational": {
    questionKey: "L6",
    domain: "Leadership DNA",
    coachingFocus: "Owning your role in problems",
    whatItLooksLike: "Athlete can recognize when their presence, tone, or behavior is contributing to dysfunction—and takes responsibility without defensiveness.",
    actionSteps: [
      "After a team breakdown, ask: 'What could I have done differently?'",
      "Practice saying 'I contributed to this problem' out loud",
      "Identify one pattern where they deflect blame—work to interrupt it"
    ],
    conversationStarters: [
      "Tell me about a time you were part of the problem, not just the solution.",
      "What's one way your leadership style might be holding the team back?",
      "How would your teammates describe your role in recent conflicts?"
    ]
  },

  // Excellence - Foundational
  "E1_foundational": {
    questionKey: "E1",
    domain: "Excellence",
    coachingFocus: "Applying feedback immediately in the next rep",
    whatItLooksLike: "Athlete listens to coaching cues, mentally rehearses the adjustment, and attempts to apply it in the next opportunity.",
    actionSteps: [
      "Practice a 'repeat-back' loop: Coach gives feedback → Athlete restates it → Applies it",
      "Focus on one piece of feedback at a time for a full week",
      "Celebrate when they apply feedback, even if the result isn't perfect yet"
    ],
    conversationStarters: [
      "What's one thing I coached you on last session? Did you try it today?",
      "What makes it hard to apply feedback right away?",
      "How do you remind yourself to use new cues in the moment?"
    ]
  },
  "E2_foundational": {
    questionKey: "E2",
    domain: "Excellence",
    coachingFocus: "Practicing weaknesses, not just strengths",
    whatItLooksLike: "Athlete chooses to work on skills they're uncomfortable with instead of defaulting to what feels good.",
    actionSteps: [
      "Identify their weakest skill and dedicate 10 minutes per session to it",
      "Track progress on the weak skill over 2-3 weeks",
      "Reframe discomfort: 'This is where I'm growing'"
    ],
    conversationStarters: [
      "What's one skill you avoid because it's uncomfortable?",
      "If you practiced your weakness as much as your strength, where would you be?",
      "What would it feel like to be known for something you struggle with now?"
    ]
  },
  "E3_foundational": {
    questionKey: "E3",
    domain: "Excellence",
    coachingFocus: "Staying coachable when corrected (reverse-scored)",
    whatItLooksLike: "Athlete responds to correction with curiosity and engagement, not withdrawal or defensiveness.",
    actionSteps: [
      "Practice responding to feedback with 'Thank you' or 'What should I try next?'",
      "Notice body language when corrected—are they open or closed off?",
      "Reframe correction as care: 'The coach believes I can do better'"
    ],
    conversationStarters: [
      "What goes through your head when I correct you?",
      "How do you want to be coached when you make a mistake?",
      "Who in your life corrects you in a way that helps? What do they do?"
    ]
  },
  "E4_foundational": {
    questionKey: "E4",
    domain: "Excellence",
    coachingFocus: "Looking for small improvements every week",
    whatItLooksLike: "Athlete actively identifies one thing to improve each week and tracks whether they're making progress.",
    actionSteps: [
      "Set one specific improvement goal per week (e.g., 'Better transitions')",
      "Check in mid-week: 'How's your focus area going?'",
      "Review progress at week's end and set a new micro-goal"
    ],
    conversationStarters: [
      "What's one small thing you want to improve this week?",
      "If you improved 1% each week, where would you be in 10 weeks?",
      "What's one thing you did better today than yesterday?"
    ]
  },

  // Discipline - Foundational
  "D1_foundational": {
    questionKey: "D1",
    domain: "Discipline",
    coachingFocus: "Resetting quickly after mistakes",
    whatItLooksLike: "Athlete makes an error, acknowledges it briefly, and refocuses on the next rep without dwelling.",
    actionSteps: [
      "Practice a physical reset routine (e.g., snap fingers, take a breath)",
      "Use self-talk: 'Next play' or 'Let's go'",
      "Celebrate when they bounce back quickly"
    ],
    conversationStarters: [
      "What helps you let go of a mistake and move on?",
      "How long does a bad rep usually stay in your head?",
      "What would it look like to reset in under 10 seconds?"
    ]
  },
  "D2_foundational": {
    questionKey: "D2",
    domain: "Discipline",
    coachingFocus: "Competing with consistent effort regardless of outcome",
    whatItLooksLike: "Athlete maintains intensity whether ahead or behind, demonstrating commitment to process over scoreboard.",
    actionSteps: [
      "Focus on effort metrics, not just results (e.g., 'Did you give your best effort?')",
      "Practice competing when the outcome feels decided",
      "Reflect after games/practice: 'Was my effort consistent?'"
    ],
    conversationStarters: [
      "When is it hardest to keep competing?",
      "What does 'leaving it all out there' mean to you?",
      "How do you want to be remembered when things aren't going your way?"
    ]
  },
  "D3_foundational": {
    questionKey: "D3",
    domain: "Discipline",
    coachingFocus: "Managing frustration without reactive behavior (reverse-scored)",
    whatItLooksLike: "Athlete feels frustration but chooses how to respond rather than letting emotion dictate their actions.",
    actionSteps: [
      "Practice labeling the emotion: 'I'm frustrated' before reacting",
      "Identify triggers and plan responses ahead of time",
      "Use breathing techniques or physical cues to regain control"
    ],
    conversationStarters: [
      "What usually sets you off during practice or competition?",
      "When you get frustrated, what do you do that helps? What makes it worse?",
      "What would it look like to feel frustration but stay in control?"
    ]
  },
  "D4_foundational": {
    questionKey: "D4",
    domain: "Discipline",
    coachingFocus: "Composure in high-pressure moments",
    whatItLooksLike: "Athlete stays calm, thinks clearly, and executes under pressure instead of rushing or freezing.",
    actionSteps: [
      "Practice pressure scenarios in training (e.g., 'game-point' drills)",
      "Develop a pre-performance routine they trust",
      "Debrief pressure moments: 'What helped you stay calm?'"
    ],
    conversationStarters: [
      "Tell me about a time you stayed composed when it mattered most.",
      "What goes through your head in pressure moments?",
      "How do you want to show up when everyone's watching?"
    ]
  },

  // Accountability - Foundational
  "A1_foundational": {
    questionKey: "A1",
    domain: "Accountability",
    coachingFocus: "Preparation and punctuality",
    whatItLooksLike: "Athlete arrives on time with necessary equipment, mentally ready to engage.",
    actionSteps: [
      "Create a pre-practice checklist (gear, mindset, nutrition)",
      "Set arrival goal: 10 minutes early, not 'right on time'",
      "Reflect on how being prepared affects their performance"
    ],
    conversationStarters: [
      "How does it feel when you show up unprepared vs. fully ready?",
      "What's one thing you could do the night before to be more prepared?",
      "How does your preparation (or lack of it) affect your teammates?"
    ]
  },
  "A2_foundational": {
    questionKey: "A2",
    domain: "Accountability",
    coachingFocus: "Completing assigned work fully",
    whatItLooksLike: "Athlete finishes every rep and set, even when fatigued, distracted, or unsupervised.",
    actionSteps: [
      "Track completion rate for one week",
      "Identify moments when they cut corners—why did it happen?",
      "Celebrate full completion as a character win, not just a physical one"
    ],
    conversationStarters: [
      "What makes you want to stop before finishing?",
      "How do you feel after finishing strong vs. cutting it short?",
      "What does finishing your work say about who you are?"
    ]
  },
  "A3_foundational": {
    questionKey: "A3",
    domain: "Accountability",
    coachingFocus: "Eliminating excuses when standards aren't met (reverse-scored)",
    whatItLooksLike: "Athlete owns mistakes and missed standards without blaming circumstances, teammates, or coaches.",
    actionSteps: [
      "Practice saying 'My fault' or 'I can do better' without adding 'but'",
      "Reflect on a recent excuse—what was the real reason?",
      "Model ownership: 'I didn't execute. I'll work on it.'"
    ],
    conversationStarters: [
      "What's your go-to excuse when things don't go well?",
      "What would it feel like to just own it, no explanation?",
      "How do you respond when someone makes excuses to you?"
    ]
  },
  "A4_foundational": {
    questionKey: "A4",
    domain: "Accountability",
    coachingFocus: "Keeping commitments even when difficult",
    whatItLooksLike: "Athlete follows through on promises and obligations, especially when inconvenient or when no one's watching.",
    actionSteps: [
      "Make one small commitment each week and track follow-through",
      "Reflect on recent broken commitments—what pattern emerges?",
      "Practice under-promising and over-delivering"
    ],
    conversationStarters: [
      "Tell me about a commitment you kept even though it was hard.",
      "What makes it easy to let commitments slide?",
      "How do you want to be known when it comes to keeping your word?"
    ]
  },

  // Belonging & Impact - Foundational
  "B1_foundational": {
    questionKey: "B1",
    domain: "Belonging & Impact",
    coachingFocus: "Integrity when unobserved",
    whatItLooksLike: "Athlete makes the right choice even when no one will know or when there's no immediate consequence.",
    actionSteps: [
      "Identify one situation where they could cut corners unnoticed—commit not to",
      "Reflect: 'Who am I when no one's watching?'",
      "Practice small acts of integrity daily (returning extra change, admitting mistakes)"
    ],
    conversationStarters: [
      "Tell me about a time you did the right thing when no one would've known.",
      "What does integrity mean to you?",
      "How do you want to feel about yourself when you're alone?"
    ]
  },
  "B2_foundational": {
    questionKey: "B2",
    domain: "Belonging & Impact",
    coachingFocus: "Respect for authority and opponents",
    whatItLooksLike: "Athlete shows respect through words, tone, and body language toward coaches, officials, and opponents.",
    actionSteps: [
      "Practice respectful responses even when frustrated",
      "Model sportsmanship: handshakes, eye contact, thanking officials",
      "Reflect after competition: 'Did I represent my values?'"
    ],
    conversationStarters: [
      "Who do you respect most? What do they do that earns it?",
      "How do you show respect when you disagree with a call?",
      "What does it say about you when you disrespect opponents or officials?"
    ]
  },
  "B3_foundational": {
    questionKey: "B3",
    domain: "Belonging & Impact",
    coachingFocus: "Resisting shortcuts and cheating (reverse-scored)",
    whatItLooksLike: "Athlete chooses the harder right over the easier wrong, even when they believe they won't get caught.",
    actionSteps: [
      "Discuss situations where shortcuts are tempting—practice resistance",
      "Reflect on past shortcuts: 'How did I feel afterward?'",
      "Celebrate when they choose the hard way"
    ],
    conversationStarters: [
      "When are you most tempted to cut corners?",
      "What would your future self thank you for doing now?",
      "What's one thing you're proud you didn't shortcut?"
    ]
  },
  "B4_foundational": {
    questionKey: "B4",
    domain: "Belonging & Impact",
    coachingFocus: "Owning results without blaming",
    whatItLooksLike: "Athlete takes responsibility for outcomes, good or bad, without deflecting to teammates, coaches, or circumstances.",
    actionSteps: [
      "Practice: 'That's on me' after mistakes",
      "Reflect on a bad result: 'What could I control?'",
      "Model ownership publicly, even when it's uncomfortable"
    ],
    conversationStarters: [
      "Tell me about a time you owned something that didn't go well.",
      "What's hard about taking responsibility when others are at fault too?",
      "How do you want your teammates to see you when things go wrong?"
    ]
  }
};

// Helper function to get coaching tip for a specific question
export const getCoachingTip = (
  domain: string,
  questionNumber: number,
  ageGroup: 'foundational' | 'emerging' | 'transformational'
): CoachingTip | undefined => {
  const key = `${domain}${questionNumber}_${ageGroup}`;
  return COACHING_TIPS[key];
};

// Helper to determine age group
export const getAgeGroup = (age: number | null): 'foundational' | 'emerging' | 'transformational' => {
  if (age === null || age >= 19) return 'transformational';
  if (age >= 17) return 'emerging';
  return 'foundational';
};
