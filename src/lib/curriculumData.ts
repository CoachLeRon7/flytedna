export interface Activity {
  title: string;
  duration?: string;
  description: string;
  prompts?: string[];
}

export interface Assessment {
  formative: string[];
  summative: string[];
}

export interface CurriculumModule {
  number: number;
  title: string;
  subtitle?: string;
  quote?: { text: string; author: string };
  objectives: string[];
  keyConcepts: string[];
  activities: Activity[];
  assessment?: Assessment;
  isPlaceholder?: boolean;
}

export interface CurriculumTrack {
  label: string;
  description: string;
  modules: CurriculumModule[];
}

export const learningLoopSteps = [
  { letter: "B", label: "Begin with Identity Prompt", description: "Start with a question that connects to who you are.", color: "hsl(var(--primary))" },
  { letter: "C", label: "Challenge the Mind", description: "Face a scenario that tests your thinking.", color: "hsl(var(--accent))" },
  { letter: "O", label: "Observe the Concept", description: "Learn the key idea through teaching and examples.", color: "hsl(var(--success))" },
  { letter: "M", label: "Make It Personal", description: "Apply the concept to your own life and experiences.", color: "hsl(var(--student-accent))" },
  { letter: "I", label: "Integrate Through Action", description: "Practice the concept in a real or simulated scenario.", color: "hsl(var(--primary))" },
  { letter: "N", label: "Navigate Feedback", description: "Receive and give peer and coach feedback.", color: "hsl(var(--accent))" },
  { letter: "G", label: "Grow Through Retrieval", description: "Solidify learning through reflection and recall.", color: "hsl(var(--success))" },
];

export const middleSchoolTrack: CurriculumTrack = {
  label: "Middle School",
  description: "Building foundational leadership identity and emotional awareness for young athletes.",
  modules: [
    {
      number: 1,
      title: "Who Am I? Discovering Core Values",
      quote: { text: "Standards create structure. Structure creates stability. Stability creates leaders.", author: "LeRon Williams" },
      objectives: [
        "Define who they are beyond athletic performance",
        "Identify 3–5 core personal standards (not preferences)",
        "Understand the difference between identity and reputation",
        "Establish a baseline FLDI Identity Score",
      ],
      keyConcepts: ["Core Values", "Identity vs Reputation", "Personal Standards", "Behavioral Definitions"],
      activities: [
        {
          title: "Identity Standards Worksheet",
          description: "List 5 words that describe who you WANT to be, circle 3 that are non-negotiable, then define each in behavior form.",
          prompts: ["Example: \"Disciplined\" = \"I complete my assignments before practice.\""],
        },
        {
          title: "FlyteDNA Platform Entry",
          description: "Log 3 core standards, one behavior to improve immediately, and complete Identity Domain Assessment (Pre).",
        },
        {
          title: "Small Team Leadership Project",
          duration: "7 days",
          description: "Work in small groups (3–5) to design and execute a micro leadership initiative.",
          prompts: [
            "Team Culture Enhancement (accountability system, encouragement protocol)",
            "Academic Performance Initiative (study pods, assignment tracking)",
            "Community Responsibility Initiative (volunteer drive, peer mentorship)",
            "Athletic Discipline Initiative (pre-practice ritual, recovery tracker)",
          ],
        },
      ],
    },
    {
      number: 2,
      title: "Beyond the Uniform: Identity Outside of Performance",
      objectives: [
        "Identify top 3 emotional triggers in sport and school",
        "Understand the difference between emotion and reaction",
        "Learn a structured reset framework",
        "Apply emotional discipline in a controlled scenario",
        "Complete Emotional Regulation Pre-Assessment",
      ],
      keyConcepts: ["Emotional Triggers", "Emotion vs Reaction", "Reset Framework", "Controlled Response"],
      activities: [
        {
          title: "Guided Discussion",
          description: "Explore what situations trigger you most, what your body does when frustrated, and why athletes perform worse under pressure.",
        },
        {
          title: "Emotional Trigger Mapping",
          description: "Identify top 3 emotional triggers in practice, competition, and school. For each, document your usual reaction and your disciplined response.",
        },
        {
          title: "Scenario Practice",
          description: "\"You miss a game-winning free throw. What happens next?\" Students physically practice: Stand tall, controlled breath, verbal reset statement.",
        },
      ],
      assessment: {
        formative: ["Participation in discussion", "Completion of trigger map"],
        summative: ["Reflection entry on top trigger and new response strategy"],
      },
    },
    {
      number: 3,
      title: "Managing Big Emotions: Pause and Reset",
      objectives: [
        "Define emotional regulation and its importance in leadership",
        "Identify personal emotional triggers in competition and academics",
        "Differentiate between reaction and response",
        "Demonstrate at least two emotional regulation strategies",
        "Create a personal \"Composure Plan\"",
      ],
      keyConcepts: ["Big Feelings vs Smart Choices", "Pause Button", "5-Second Reset", "Body Signals"],
      activities: [
        {
          title: "Trigger Mapping",
          duration: "10–12 min",
          description: "Complete a \"Pressure Profile\" worksheet identifying what makes you lose focus, self-talk patterns, body stress signals, and behavioral responses.",
          prompts: ["Use emoji scale: 😡 😰 🤢 😌 😎 to identify body signals"],
        },
        {
          title: "Reaction vs Response Drill",
          duration: "10 min",
          description: "Coach presents scenarios (miss free throw, get benched, fail a test). Students write natural reaction then rewrite as regulated response.",
        },
        {
          title: "90-Second Reset Protocol",
          duration: "10 min",
          description: "Learn 4-4 breathing, physical anchor (tap wrist, adjust wristband), and practice reset after stress stimulus.",
        },
        {
          title: "Composure Plan Creation",
          duration: "10–15 min",
          description: "Build a 3-step composure card: Stop → Breathe → Next Play.",
        },
      ],
      assessment: {
        formative: ["Participation in stress drills", "Completion of Trigger Map", "Demonstration of reset technique"],
        summative: ["Submission of Personal Composure Plan", "Reflection: \"Describe a time you lost composure. How would you handle it now?\""],
      },
    },
    {
      number: 4,
      title: "My Strengths, My Growth: Personal Assessment",
      objectives: [
        "Identify 3–5 core strengths",
        "Identify 2–3 growth areas limiting leadership",
        "Distinguish between talent and developed skill",
        "Create a 30-day personal development plan",
        "Connect strengths to purpose and leadership impact",
      ],
      keyConcepts: ["Strengths Audit", "Growth Areas", "Talent vs Skill", "Development Planning"],
      activities: [
        {
          title: "Strengths Audit",
          description: "Answer: \"When do you feel awesome?\" and \"What do teachers say you're good at?\"",
        },
        {
          title: "Growth Area Focus",
          description: "Pick one focus area only and create a weekly habit instead of a 60-day plan.",
        },
        {
          title: "Simple Development Plan",
          description: "Complete: \"I want to get better at...\", \"I will practice by...\", \"My helper is...\"",
        },
      ],
      assessment: {
        formative: ["Completion of Strengths & Blind Spot audit", "Participation in discussion"],
        summative: ["Submission of 30-Day Development Plan", "Reflection: \"If I follow this plan, who will I become?\""],
      },
    },
    {
      number: 5,
      title: "Building My Character Blueprint",
      subtitle: "Become the Teammate Everyone Wants",
      objectives: [
        "Define leadership as influence rather than authority",
        "Identify behaviors that increase or decrease leadership credibility",
        "Recognize how emotional energy affects teammates",
        "Practice leadership communication during team scenarios",
        "Demonstrate behaviors that positively influence team culture",
      ],
      keyConcepts: ["Leadership vs Popularity", "Influence vs Authority", "Credibility", "Emotional Contagion", "Culture Builders vs Culture Killers"],
      activities: [
        {
          title: "Leadership Influence Mapping",
          description: "Reflect on people you respect as leaders and identify 3 leadership behaviors you admire.",
        },
        {
          title: "Culture Builders vs Culture Killers",
          description: "Categorize behaviors: Encourages teammates vs Complains, Takes responsibility vs Blames others, Stays composed vs Loses emotional control.",
        },
        {
          title: "Team Scenario Leadership Drill",
          description: "Respond to real scenarios: teammate quits during practice, blames others after a loss, two teammates arguing. Focus on behavioral leadership.",
        },
      ],
      assessment: {
        formative: ["Participation in discussions", "Leadership behavior in scenarios"],
        summative: ["Leadership Reflection: describe a moment to positively influence your team"],
      },
    },
    {
      number: 6,
      title: "When Things Get Hard: Coping Skills for Stress",
      objectives: ["Learn healthy coping strategies for athletic and academic stress", "Build resilience through structured stress management"],
      keyConcepts: ["Stress Management", "Coping Strategies", "Resilience"],
      activities: [],
      isPlaceholder: true,
    },
    {
      number: 7,
      title: "My Story: Creating a Personal Narrative",
      objectives: ["Craft a personal leadership narrative", "Connect past experiences to future identity"],
      keyConcepts: ["Personal Narrative", "Identity Story", "Purpose"],
      activities: [],
      isPlaceholder: true,
    },
    {
      number: 8,
      title: "Growth Mindset: Turning Setbacks into Comebacks",
      objectives: ["Develop a growth mindset approach to challenges", "Transform setbacks into learning opportunities"],
      keyConcepts: ["Growth Mindset", "Resilience", "Learning from Failure"],
      activities: [],
      isPlaceholder: true,
    },
  ],
};

export const highSchoolTrack: CurriculumTrack = {
  label: "High School",
  description: "Advanced leadership development with deeper self-awareness, influence strategies, and competitive maturity.",
  modules: [
    {
      number: 1,
      title: "Writing Your Personal Code",
      quote: { text: "Standards create structure. Structure creates stability. Stability creates leaders.", author: "LeRon Williams" },
      objectives: [
        "Define who they are beyond athletic performance",
        "Identify 3–5 core personal standards (not preferences)",
        "Understand the difference between identity and reputation",
      ],
      keyConcepts: ["Personal Code", "Identity Standards", "Behavioral Definitions", "Leadership Combine"],
      activities: [
        {
          title: "Identity Standards Worksheet",
          description: "Pick 5 words that describe who you WANT to be, narrow to 3 non-negotiables, define each in behavior form.",
        },
        {
          title: "FlyteDNA Platform Logging",
          description: "Log 3 core standards, one behavior to improve immediately, and an action plan for next steps.",
        },
        {
          title: "Small Team Leadership Project",
          duration: "7 days",
          description: "Design and execute a micro leadership initiative with gamification points. Teams compete for tokens accumulated over the 16-week session.",
          prompts: [
            "Team Culture Enhancement",
            "Academic Performance Initiative",
            "Community Responsibility Initiative",
            "Athletic Discipline Initiative",
          ],
        },
      ],
    },
    {
      number: 2,
      title: "Core Values: What You Stand For",
      subtitle: "Identity Statement: Who \"I Am\" at My Core",
      objectives: [
        "Define top 3–5 core values",
        "Explain how values influence daily decisions and behavior",
        "Identify moments where actions align or misalign with values",
        "Begin building a values-based decision-making framework",
      ],
      keyConcepts: [
        "Values = Internal Compass",
        "Stated vs Lived Values",
        "Values Show Up in Behavior",
        "Pressure Reveals Values",
        "Identity → Values → Behavior → Reputation",
      ],
      activities: [
        {
          title: "Values Draft Exercise",
          description: "\"Draft\" your top values like a team roster — forces prioritization. Choose top 10 → narrow to 5 → narrow to 3.",
        },
        {
          title: "Game Film Reflection",
          description: "Watch a clip or recall a game. Ask: Where did values show up? Where did they break down?",
        },
        {
          title: "Pressure Simulation",
          description: "Competitive drill with added stressors (bad call, trash talk, fatigue). Reflect: \"Which values held? Which didn't?\"",
        },
        {
          title: "Values vs Feelings Debate",
          description: "\"Do you always feel like doing the right thing?\" Teaches discipline over emotion.",
        },
      ],
    },
    {
      number: 3,
      title: "Cognitive Reframing: Changing the Narrative",
      objectives: [
        "Define emotional regulation and its importance in leadership",
        "Identify personal emotional triggers in competition, academics, and career",
        "Differentiate between reaction and response",
        "Demonstrate at least two emotional regulation strategies",
        "Create a personal \"Composure Plan\"",
      ],
      keyConcepts: [
        "Emotional Regulation vs Suppression",
        "Trigger → Thought → Emotion → Action Cycle",
        "Reaction vs Response",
        "Cognitive Reframing",
        "Stress as Energy",
        "Leadership Composure",
        "Emotional Contagion",
      ],
      activities: [
        {
          title: "Trigger Mapping",
          duration: "10–12 min",
          description: "Complete a \"Pressure Profile\" with internal dialogue rewrite and performance sabotage thought identification.",
        },
        {
          title: "Reaction vs Response Drill",
          duration: "10 min",
          description: "Coach presents high-pressure scenarios. Students write reaction, then rewrite as regulated response with leadership anchor statement.",
        },
        {
          title: "90-Second Reset Protocol",
          duration: "10 min",
          description: "4-4-6 breathing, eye focus reset, internal cue phrase (\"Calm. Clear. Confident.\"). Practice with competitive mini-drill.",
        },
        {
          title: "Composure Plan Creation",
          duration: "10–15 min",
          description: "Build Game & Exam Composure Plan including pre-game identity statement and mistake recovery timeline (5 sec, 30 sec, 2 min).",
        },
      ],
      assessment: {
        formative: ["Participation in stress drills", "Completion of Trigger Map", "Demonstration of reset technique"],
        summative: ["Submission of Personal Composure Plan", "Reflection: \"Describe a time you lost composure. How would you handle it now?\""],
      },
    },
    {
      number: 4,
      title: "Strengths, Gaps & Growth Plan",
      subtitle: "You don't drift into greatness. You design it.",
      objectives: [
        "Identify 3–5 core strengths",
        "Identify 2–3 growth areas limiting leadership",
        "Distinguish between talent and developed skill",
        "Create a 30–60 day personal development plan",
        "Connect strengths to purpose and leadership impact",
      ],
      keyConcepts: [
        "Strength vs Skill",
        "Blind Spots",
        "Growth Mindset",
        "Feedback as Fuel",
        "Identity-Based Growth",
        "Intentional Practice",
      ],
      activities: [
        {
          title: "Personal Strengths Audit",
          duration: "10–15 min",
          description: "What do teammates compliment you on? When do you perform best? What comes naturally? Identify top 3 strengths and transferable strengths (sport → school).",
        },
        {
          title: "Blind Spot Reflection",
          duration: "10 min",
          description: "Where do you struggle under pressure? What feedback do you resist? What habits hold you back? Partner discussion on immediate leadership elevation.",
        },
        {
          title: "30–60 Day Development Plan",
          duration: "15–20 min",
          description: "Build structured plan: Area of Growth, Why It Matters, Daily Habit, Weekly Action, Accountability Partner, Measurement of Progress.",
        },
        {
          title: "Identity Alignment Reflection",
          duration: "5–8 min",
          description: "Connect Strength → Core Value (Module 1), Growth Area → Character Goal (Module 2). \"How does this growth plan help you become who you said you want to be?\"",
        },
      ],
      assessment: {
        formative: ["Completion of Strengths & Blind Spot audit", "Participation in discussion"],
        summative: ["Submission of 30–60 Day Development Plan", "Reflection: \"If I follow this plan, who will I become?\""],
      },
    },
    {
      number: 5,
      title: "Leadership & Influence",
      subtitle: "Leadership Is Responsibility",
      objectives: [
        "Define leadership as influence rather than authority",
        "Identify behaviors that increase or decrease leadership credibility",
        "Recognize how emotional energy affects teammates",
        "Practice leadership communication during team scenarios",
        "Demonstrate behaviors that positively influence team culture",
      ],
      keyConcepts: [
        "Leadership vs Popularity",
        "Influence vs Authority",
        "Credibility",
        "Emotional Contagion",
        "Leadership Through Example",
        "Accountability Leadership",
        "Culture Builders vs Culture Killers",
      ],
      activities: [
        {
          title: "Leadership Influence Mapping",
          description: "Reflect on leaders you respect. Identify 3 leadership behaviors you admire. What do these leaders consistently do?",
        },
        {
          title: "Culture Builders vs Culture Killers",
          description: "Categorize behaviors in a table format. Discuss which behaviors show up most on teams.",
        },
        {
          title: "Team Scenario Leadership Drill",
          description: "Respond to scenarios: teammate quits, blames others, two arguing, skipping conditioning, social exclusion. Practice verbal leadership responses.",
        },
        {
          title: "Leadership Commitment Card",
          description: "Create a Leadership Standard Card: \"A leader on my team always...\" Choose 3 leadership behaviors to commit to. Save in FlyteDNA profile.",
        },
      ],
      assessment: {
        formative: ["Participation in discussions", "Leadership behavior in scenarios", "Engagement in team drills"],
        summative: ["Leadership Reflection on positively influencing your team", "What would you do differently after this lesson?"],
      },
    },
    {
      number: 6,
      title: "Emotional Intelligence: Self-Awareness and Regulation",
      objectives: ["Develop deep self-awareness and emotional intelligence", "Master advanced emotional regulation techniques"],
      keyConcepts: ["Emotional Intelligence", "Self-Awareness", "Advanced Regulation"],
      activities: [],
      isPlaceholder: true,
    },
    {
      number: 7,
      title: "Character vs. Reputation: Building from the Inside Out",
      objectives: ["Distinguish between character and reputation", "Build authentic leadership from core identity"],
      keyConcepts: ["Character", "Reputation", "Authenticity", "Inside-Out Leadership"],
      activities: [],
      isPlaceholder: true,
    },
    {
      number: 8,
      title: "Mastery Mindset: Owning Your Growth Journey",
      objectives: ["Develop a mastery-oriented approach to leadership", "Own your continuous growth journey"],
      keyConcepts: ["Mastery Mindset", "Continuous Growth", "Ownership"],
      activities: [],
      isPlaceholder: true,
    },
  ],
};
