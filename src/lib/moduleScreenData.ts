// Screen-by-screen data for the interactive B.coming Learning Loop (Modules 1–3)

export type ScreenType =
  | "hook"
  | "workbook"
  | "concept"
  | "personal"
  | "action"
  | "statement"
  | "plan";

export interface HookScreenData {
  type: "hook";
  quote: { text: string; author: string };
  hookQuestion: string;
  hookSubtext?: string;
}

export interface WorkbookPrompt {
  label: string;
  placeholder: string;
  multiField?: boolean; // e.g. "three words" → 3 separate inputs
  fieldCount?: number;
  wordBank?: string[]; // clickable word selection instead of free text
  minSelections?: number; // minimum words to select from wordBank
  allowCustom?: boolean; // show text input alongside word bank
}

export interface WorkbookScreenData {
  type: "workbook";
  title: string;
  description: string;
  prompts: WorkbookPrompt[];
}

export interface ConceptLayer {
  label: string;
  description: string;
  icon: string; // emoji
}

export interface ConceptScreenData {
  type: "concept";
  title: string;
  description: string;
  layers: ConceptLayer[];
  insight: string;
}

export interface PersonalCategory {
  label: string;
  placeholder: string;
  isHighlighted?: boolean;
  wordBank?: string[];
  minSelections?: number;
  allowCustom?: boolean;
}

export interface PersonalScreenData {
  type: "personal";
  title: string;
  description: string;
  categories: PersonalCategory[];
}

export interface ActionScreenData {
  type: "action";
  title: string;
  description: string;
  values: string[];
  valueDefinitions?: Record<string, string>;
  steps: { instruction: string; count: number }[];
  definitionPrompt: string;
}

export interface StatementSlot {
  name: string;
  label: string;
  /** Screen index to pull choices from, or undefined for static options */
  sourceScreen?: number;
  /** How to extract options from the source screen data */
  sourceKey?: "action-values" | "personal-category" | "workbook-prompt";
  /** For personal-category / workbook-prompt: which index within that screen */
  sourceIndex?: number;
  /** Static fallback options if no source or source has no data */
  staticOptions?: string[];
}

export interface StatementScreenData {
  type: "statement";
  title: string;
  description: string;
  /** Template with {slotName} placeholders */
  template: string;
  /** Ending text after the last slot (optional freeform) */
  closingPrompt?: string;
  closingPlaceholder?: string;
  helpText: string;
  slots?: StatementSlot[];
}

export interface PlanScreenData {
  type: "plan";
  title: string;
  prompt: string;
  placeholder: string;
  completionMessage: string;
}

export type ModuleScreen =
  | HookScreenData
  | WorkbookScreenData
  | ConceptScreenData
  | PersonalScreenData
  | ActionScreenData
  | StatementScreenData
  | PlanScreenData;

export interface ModuleExperienceData {
  moduleNumber: number;
  moduleTitle: string;
  track: "middle" | "high";
  screens: ModuleScreen[];
}

// ─── VALUES LIST (shared across modules) ───
const coreValuesList = [
  "Integrity", "Discipline", "Respect", "Accountability", "Loyalty",
  "Courage", "Honesty", "Perseverance", "Empathy", "Humility",
  "Gratitude", "Compassion", "Responsibility", "Patience", "Kindness",
  "Fairness", "Generosity", "Determination", "Confidence", "Resilience",
  "Teamwork", "Excellence", "Faith", "Self-Control", "Commitment",
  "Dependability", "Optimism", "Creativity", "Leadership", "Service",
  "Trustworthiness", "Consistency",
];

const coreValuesDefinitions: Record<string, string> = {
  "Integrity": "Doing the right thing even when no one is watching",
  "Discipline": "Staying consistent with your habits and standards daily",
  "Respect": "Treating others the way you'd want to be treated",
  "Accountability": "Owning your actions, mistakes, and results",
  "Loyalty": "Standing by your team and people through thick and thin",
  "Courage": "Doing what's hard or scary because it matters",
  "Honesty": "Being truthful with yourself and others",
  "Perseverance": "Pushing through obstacles and never giving up",
  "Empathy": "Understanding and caring about how others feel",
  "Humility": "Staying grounded and open to learning from anyone",
  "Gratitude": "Appreciating what you have and the people around you",
  "Compassion": "Showing genuine care and kindness to others",
  "Responsibility": "Following through on what you said you'd do",
  "Patience": "Trusting the process and staying calm under pressure",
  "Kindness": "Going out of your way to lift others up",
  "Fairness": "Treating everyone equally and playing by the rules",
  "Generosity": "Giving your time, energy, or support freely",
  "Determination": "Refusing to quit until you reach your goal",
  "Confidence": "Believing in your ability to rise to the challenge",
  "Resilience": "Bouncing back stronger after setbacks",
  "Teamwork": "Putting the team's success above your own",
  "Excellence": "Giving your absolute best in everything you do",
  "Faith": "Trusting in something bigger than yourself",
  "Self-Control": "Managing your emotions and impulses in tough moments",
  "Commitment": "Staying dedicated even when it gets uncomfortable",
  "Dependability": "Being someone others can always count on",
  "Optimism": "Choosing to see possibility even in hard times",
  "Creativity": "Finding new ways to solve problems and improve",
  "Leadership": "Influencing others through your actions and character",
  "Service": "Using your talents to help and serve others",
  "Trustworthiness": "Being reliable, honest, and true to your word",
  "Consistency": "Showing up the same way every single day",
};

// ════════════════════════════════════════════════════════════════
// MODULE 1 — Middle School: "Who Am I? Discovering Core Values"
// ════════════════════════════════════════════════════════════════
export const module1MS: ModuleExperienceData = {
  moduleNumber: 1,
  moduleTitle: "Who Am I? Discovering Core Values",
  track: "middle",
  screens: [
    {
      type: "hook",
      quote: {
        text: "Standards create structure. Structure creates stability. Stability creates leaders.",
        author: "LeRon Williams",
      },
      hookQuestion: "If your sport was taken away tomorrow, who would you still be?",
      hookSubtext: "Take a moment to sit with that question before you continue.",
    },
    {
      type: "workbook",
      title: "Challenge the Mind",
      description: "Let's explore how your identity connects to your performance. Answer honestly — these answers are private and only visible to you.",
      prompts: [
        { label: "When I perform well I feel...", placeholder: "Select at least 3 words", wordBank: ["Confident","Accomplished","Proud","Energized","Focused","Unstoppable","In control","Locked in","On fire","Empowered","Motivated","Driven","Sharp","Dialed in","Elite","Calm confidence","At peace","Fulfilled","Purposeful","Aligned","Winning","Validated","Respected","Relentless","Fearless","Inspired","Clear minded","Dominant","Resilient","Capable","Limitless","In rhythm","Strong","Elevated","Ready"], minSelections: 3 },
        { label: "When I perform poorly I tell myself...", placeholder: "Select at least 3 words", wordBank: ["Do better","I'm Not enough","Keep going","Learn from it","Shake it off","Lock back in","You got this","Try again","Stay focused","Be better","Fix it","Move forward","No excuses","Refocus now","Next play","Bounce back","Stay composed","Reset mentally","Control effort","Trust yourself","Stay disciplined","I quit","Figure it out","Growth moment","Own it","Stay hungry","Keep working","Be resilient","Adjust quickly","Stay confident","Keep faith","Stop trying","Stay ready","Rise up","I'm terrible"], minSelections: 3 },
        { label: "Three words that describe me...", placeholder: "Select exactly 3 words", wordBank: ["Fast","Strong","Explosive","Agile","Competitive","Tough","Conditioned","Skilled","Focused","Disciplined","Smart","Curious","Dedicated","Organized","Prepared","Determined","Consistent","Accountable","Focused learner","Driven","Leader","Confident","Respectful","Responsible","Resilient","Positive","Trustworthy","Motivated","Coachable","Influential"], minSelections: 3 },
        { label: "Something I fear losing...", placeholder: "Or write your own...", wordBank: ["My chance to reach my potential","The trust people have in me","Opportunities I worked hard to earn","My confidence in tough moments","The respect of my teammates","My love for the game","Control over my own future","The discipline I've built daily","My identity as a leader","The progress I've made so far","My competitive edge and mindset","The support from my family","My focus during important moments","The belief I have in myself","My spot on the team","The habits that keep me consistent","My ability to bounce back","The goals I set for myself","My reputation as a hard worker","The trust from my coaches","My physical and mental strength","The momentum I've been building","My passion for getting better","The discipline to stay committed","My drive to succeed every day","The chance to prove myself","My ability to stay locked in","The standard I hold for myself","My growth as both athlete and leader","The opportunity to make an impact"], minSelections: 1, allowCustom: true },
      ],
    },
    {
      type: "concept",
      title: "The Three Layers of Identity",
      description: "Most athletes build their identity on performance. Leaders build it on character.",
      layers: [
        { label: "Performance", description: "Stats, wins, achievements — what you do.", icon: "🏆" },
        { label: "Reputation", description: "What others say about you — how you're seen.", icon: "👥" },
        { label: "Character", description: "Who you are when nobody is watching — your foundation.", icon: "💎" },
      ],
      insight: "Character is the deepest layer — and the only one fully in your control. Everything else is built on top of it.",
    },
    {
      type: "personal",
      title: "Map Your Identity",
      description: "Categorize your life to separate your roles from your core values.",
      categories: [
        {
          label: "Roles I Play",
          placeholder: "Select roles that apply to you",
          wordBank: ["Athlete", "Student", "Brother", "Sister", "Teammate", "Christian", "Mentor", "Mentee", "Employee"],
          minSelections: 1,
          allowCustom: true,
        },
        {
          label: "Achievements",
          placeholder: "Select achievements you're proud of",
          wordBank: [
            "Made the team", "Started a game", "Won a championship", "Set a personal record",
            "Made honor roll", "Earned a scholarship", "Captain or team leader", "All-conference selection",
            "MVP award", "Most improved player", "Community service award", "Led a team comeback",
            "Scored a game-winning play", "Maintained a high GPA", "Earned varsity letter",
            "Helped a teammate succeed", "Overcame an injury", "Earned coach's trust",
            "Consistent starter", "Led by example daily",
          ],
          minSelections: 1,
          allowCustom: true,
        },
        {
          label: "Expectations",
          placeholder: "Select expectations placed on you",
          wordBank: [
            "Play well every game", "Lead the team", "Don't mess up", "Be the example",
            "Score more points", "Stay disciplined", "Keep my grades up", "Be tough",
            "Never show weakness", "Always be ready", "Win at all costs", "Protect my teammates",
            "Stay composed under pressure", "Live up to my potential", "Outwork everyone",
            "Represent the program well", "Handle adversity", "Be coachable",
            "Stay focused 24/7", "Carry the team",
          ],
          minSelections: 1,
          allowCustom: true,
        },
        {
          label: "What Matters Most",
          placeholder: "Select what matters most to you",
          isHighlighted: true,
          wordBank: [
            "Discipline", "Loyalty", "Respect", "Integrity", "Faith", "Family",
            "Hard work", "Honesty", "Courage", "Kindness", "Accountability", "Perseverance",
            "Excellence", "Humility", "Gratitude", "Service", "Self-control", "Trustworthiness",
            "Compassion", "Purpose", "Consistency", "Commitment", "Leadership", "Passion",
            "Resilience", "Growth", "Unity", "Fairness", "Confidence", "Selflessness",
          ],
          minSelections: 1,
          allowCustom: true,
        },
      ],
    },
    {
      type: "action",
      title: "The Values Draft",
      description: "Draft your core values like building a team roster. You'll narrow down to the 3 values that are non-negotiable for who you want to be.",
      values: coreValuesList,
      valueDefinitions: coreValuesDefinitions,
      steps: [
        { instruction: "Select 10 values that resonate with you", count: 10 },
        { instruction: "Narrow to your top 5", count: 5 },
        { instruction: "Choose your 3 non-negotiable core standards", count: 3 },
      ],
      definitionPrompt: "Define each value as a specific behavior. Example: \"Disciplined\" = \"I complete my assignments before practice.\"",
    },
    {
      type: "statement",
      title: "Your Identity Statement",
      description: "Synthesize everything you've discovered into a single defining statement.",
      template: "I am not just a [sport] player. I value [value 1], [value 2], and [value 3]. At my best, I show these values through...",
      helpText: "This statement will become a key part of your Leadership Dashboard.",
    },
    {
      type: "plan",
      title: "Your Action Plan",
      prompt: "Identify one behavior you must improve immediately to align with your new Identity Statement.",
      placeholder: "e.g., I will stop complaining to the referee when a call goes against me.",
      completionMessage: "🎉 Module 1 Complete! You've defined your identity beyond your sport. Your Identity Statement and Core Values are now part of your leadership profile.",
    },
  ],
};

// ════════════════════════════════════════════════════════════════
// MODULE 1 — High School: "Writing Your Personal Code"
// ════════════════════════════════════════════════════════════════
export const module1HS: ModuleExperienceData = {
  ...module1MS,
  moduleTitle: "Writing Your Personal Code",
  track: "high",
};

// ════════════════════════════════════════════════════════════════
// MODULE 2 — Middle School: "Beyond the Uniform"
// ════════════════════════════════════════════════════════════════
export const module2MS: ModuleExperienceData = {
  moduleNumber: 2,
  moduleTitle: "Beyond the Uniform: Identity Outside of Performance",
  track: "middle",
  screens: [
    {
      type: "hook",
      quote: {
        text: "Between stimulus and response there is a space. In that space is our power to choose our response.",
        author: "Viktor Frankl",
      },
      hookQuestion: "Think of the last time you lost your cool during a game or practice. What triggered it?",
      hookSubtext: "Emotional control isn't about suppressing feelings — it's about choosing your response.",
    },
    {
      type: "workbook",
      title: "Challenge the Mind",
      description: "Explore your emotional landscape. These answers are private.",
      prompts: [
        { label: "What situations trigger you most?", placeholder: "e.g., Bad calls, being benched, failing a test" },
        { label: "What does your body do when you're frustrated?", placeholder: "e.g., Clench fists, raise voice, shut down" },
        { label: "Why do athletes perform worse under pressure?", placeholder: "e.g., Fear of failure, overthinking" },
        { label: "When I'm angry, the first thing I do is...", placeholder: "e.g., Yell at a teammate, blame someone else" },
      ],
    },
    {
      type: "concept",
      title: "Emotion vs Reaction",
      description: "Understanding the difference between what you feel and what you do is the foundation of emotional discipline.",
      layers: [
        { label: "Trigger", description: "The event that sparks an emotional response.", icon: "⚡" },
        { label: "Emotion", description: "The feeling — anger, frustration, fear. This is natural.", icon: "🔥" },
        { label: "Reaction", description: "Your uncontrolled, immediate response. This is the problem.", icon: "💥" },
        { label: "Response", description: "A chosen, disciplined action. This is the goal.", icon: "🎯" },
      ],
      insight: "You can't control the trigger. You can't always control the emotion. But you can ALWAYS control the response.",
    },
    {
      type: "personal",
      title: "Emotional Trigger Mapping",
      description: "Identify your top 3 triggers across different areas of your life.",
      categories: [
        { label: "Practice Triggers", placeholder: "e.g., Coach criticism, teammate mistakes" },
        { label: "Competition Triggers", placeholder: "e.g., Bad calls, falling behind, crowd pressure" },
        { label: "School Triggers", placeholder: "e.g., Group projects, bad grades, social drama" },
        { label: "My Usual Reaction", placeholder: "e.g., Shut down, get loud, blame others", isHighlighted: true },
      ],
    },
    {
      type: "action",
      title: "The Reset Framework",
      description: "Build your personal reset toolkit. Select the strategies that work best for you.",
      values: [
        "Deep Breathing (4-4)", "Count to 10", "Walk Away Briefly", "Talk to a Trusted Person",
        "Physical Anchor (tap wrist)", "Positive Self-Talk", "Visualize Success", "Journal It Out",
        "Listen to Music", "Exercise / Move", "Pause and Observe", "Name the Emotion",
        "Reframe the Situation", "Focus on Next Play", "Ground Yourself (5 senses)", "Power Pose",
      ],
      steps: [
        { instruction: "Select 6 strategies you'd be willing to try", count: 6 },
        { instruction: "Narrow to your top 3 go-to strategies", count: 3 },
        { instruction: "Choose your #1 reset move", count: 1 },
      ],
      definitionPrompt: "Describe when and how you'll use your #1 reset strategy. Example: \"When I get a bad call, I tap my wrist and say 'Next play.'\"",
    },
    {
      type: "statement",
      title: "Your Composure Statement",
      description: "Write a short statement that anchors you in moments of pressure.",
      template: "When I feel [trigger emotion], I choose to [response action]. I reset by [reset strategy]. I am in control of my response.",
      helpText: "This will be your go-to script when emotions run high.",
    },
    {
      type: "plan",
      title: "Your Reset Action Plan",
      prompt: "Describe one specific scenario this week where you will practice your reset strategy instead of reacting.",
      placeholder: "e.g., If I get benched during Wednesday's game, I will take 3 deep breaths and focus on cheering my teammates.",
      completionMessage: "🎉 Module 2 Complete! You now have a Composure Statement and a Reset Strategy. True leaders control the moment — they don't let the moment control them.",
    },
  ],
};

// ════════════════════════════════════════════════════════════════
// MODULE 2 — High School: "Core Values: What You Stand For"
// ════════════════════════════════════════════════════════════════
export const module2HS: ModuleExperienceData = {
  moduleNumber: 2,
  moduleTitle: "Core Values: What You Stand For",
  track: "high",
  screens: [
    {
      type: "hook",
      quote: {
        text: "It's not hard to make decisions when you know what your values are.",
        author: "Roy Disney",
      },
      hookQuestion: "When was the last time you did the right thing even though it was hard?",
      hookSubtext: "Your values are revealed in pressure, not in comfort.",
    },
    {
      type: "workbook",
      title: "Challenge the Mind",
      description: "Explore the gap between stated values and lived values.",
      prompts: [
        { label: "A value I say I have but sometimes don't live by...", placeholder: "e.g., Respect — but I talk back when frustrated" },
        { label: "A time my actions didn't match my values...", placeholder: "e.g., I said I value teamwork but blamed a teammate" },
        { label: "The value that shows up most when I'm at my best...", placeholder: "e.g., Discipline" },
        { label: "The value that disappears first under pressure...", placeholder: "e.g., Patience" },
      ],
    },
    {
      type: "concept",
      title: "The Values Chain",
      description: "Your identity drives your values. Your values drive your behavior. Your behavior builds your reputation.",
      layers: [
        { label: "Identity", description: "Who you believe you are at your core.", icon: "🧬" },
        { label: "Values", description: "Your internal compass — what you stand for.", icon: "🧭" },
        { label: "Behavior", description: "How values show up in daily actions.", icon: "⚡" },
        { label: "Reputation", description: "What others see and say about you.", icon: "🪞" },
      ],
      insight: "You don't get to choose your reputation directly. You choose your values, live them through behavior, and your reputation follows.",
    },
    {
      type: "personal",
      title: "Values Alignment Check",
      description: "Reflect on where your values show up — and where they break down.",
      categories: [
        { label: "Values That Hold Under Pressure", placeholder: "e.g., Discipline, Work Ethic" },
        { label: "Values That Break Under Pressure", placeholder: "e.g., Patience, Respect" },
        { label: "Situations Where I'm Most Aligned", placeholder: "e.g., When I'm prepared, when I lead by example" },
        { label: "Situations Where I'm Least Aligned", placeholder: "e.g., When tired, after a loss", isHighlighted: true },
      ],
    },
    {
      type: "action",
      title: "The Values Draft",
      description: "Draft your core values like a team roster. Prioritize ruthlessly — these become your decision-making framework.",
      values: coreValuesList,
      valueDefinitions: coreValuesDefinitions,
      steps: [
        { instruction: "Select 10 values that resonate with you", count: 10 },
        { instruction: "Narrow to your top 5", count: 5 },
        { instruction: "Choose your 3 non-negotiable core values", count: 3 },
      ],
      definitionPrompt: "For each value, describe a specific behavior that proves you live it. Example: \"Accountability\" = \"I own my mistakes in front of the team.\"",
    },
    {
      type: "statement",
      title: "Your Identity Statement",
      description: "Craft a statement that connects who you are to what you stand for.",
      template: "I am a leader who values [value 1], [value 2], and [value 3]. Even under pressure, I choose to [specific behavior]. My values are not feelings — they are decisions.",
      helpText: "This statement becomes your anchor in high-pressure moments.",
    },
    {
      type: "plan",
      title: "Your Values Action Plan",
      prompt: "Identify one situation this week where you'll intentionally choose values over feelings.",
      placeholder: "e.g., When coach gives criticism on Thursday, I will listen fully, say 'thank you,' and apply it in the next rep — even if I disagree.",
      completionMessage: "🎉 Module 2 Complete! You've drafted your core values and built a values-based decision framework. Leaders don't drift — they decide.",
    },
  ],
};

// ════════════════════════════════════════════════════════════════
// MODULE 3 — Middle School: "Managing Big Emotions: Pause & Reset"
// ════════════════════════════════════════════════════════════════
export const module3MS: ModuleExperienceData = {
  moduleNumber: 3,
  moduleTitle: "Managing Big Emotions: Pause and Reset",
  track: "middle",
  screens: [
    {
      type: "hook",
      quote: {
        text: "You will never be able to control everything that happens in a game. But you can always control what happens next.",
        author: "LeRon Williams",
      },
      hookQuestion: "Have you ever made a mistake in a game and then made it WORSE by how you reacted?",
      hookSubtext: "Today you'll learn how to hit the pause button before your emotions take over.",
    },
    {
      type: "workbook",
      title: "Pressure Profile",
      description: "Let's map what happens inside when pressure hits. Use the emoji scale: 😡 😰 🤢 😌 😎",
      prompts: [
        { label: "What makes you lose focus?", placeholder: "e.g., Bad calls, getting yelled at, falling behind" },
        { label: "What does your body feel when stressed?", placeholder: "e.g., Tight chest, shaking hands, racing heart" },
        { label: "What do you tell yourself when things go wrong?", placeholder: "e.g., \"I'm trash\", \"I always choke\"" },
        { label: "What do you usually DO when stressed?", placeholder: "e.g., Slam equipment, shut down, argue" },
      ],
    },
    {
      type: "concept",
      title: "Big Feelings vs Smart Choices",
      description: "Your feelings are real. But your feelings don't get to make your decisions.",
      layers: [
        { label: "Feel It", description: "Recognize the emotion. It's okay to be angry, scared, or frustrated.", icon: "😤" },
        { label: "Pause", description: "Hit the mental pause button. Create space between feeling and doing.", icon: "⏸️" },
        { label: "Choose", description: "Pick a smart response instead of an automatic reaction.", icon: "🧠" },
        { label: "Act", description: "Execute your chosen response with composure.", icon: "✅" },
      ],
      insight: "The 5-Second Reset: Feel → Pause → Breathe → Choose → Act. Champions don't react. They respond.",
    },
    {
      type: "personal",
      title: "Reaction vs Response",
      description: "For each scenario, write what you'd USUALLY do (reaction) and what a LEADER would do (response).",
      categories: [
        { label: "You miss a game-winning free throw", placeholder: "My reaction: ... → My response: ..." },
        { label: "Coach benches you mid-game", placeholder: "My reaction: ... → My response: ..." },
        { label: "A teammate blames you for a loss", placeholder: "My reaction: ... → My response: ..." },
        { label: "You fail an important test", placeholder: "My reaction: ... → My response: ...", isHighlighted: true },
      ],
    },
    {
      type: "action",
      title: "Build Your Reset Toolkit",
      description: "Choose the strategies that help YOU calm down and refocus. You'll narrow to your top reset moves.",
      values: [
        "4-4 Breathing", "Count Backwards from 10", "Tap Your Wrist",
        "Say \"Next Play\"", "Squeeze and Release Fists", "Look at a Fixed Point",
        "Roll Your Shoulders", "Adjust Your Wristband", "Positive Self-Talk",
        "Walk to Water Fountain", "Name 3 Things You See", "Clap Your Hands Once",
        "Deep Exhale", "Touch Your Toes", "Close Eyes for 3 Seconds", "Nod and Move On",
      ],
      steps: [
        { instruction: "Select 6 strategies you'd try", count: 6 },
        { instruction: "Narrow to your top 3", count: 3 },
        { instruction: "Choose your #1 go-to reset move", count: 1 },
      ],
      definitionPrompt: "Describe your 3-step composure card: Stop → Breathe → Next Play. What does each step look like for YOU?",
    },
    {
      type: "statement",
      title: "Your Composure Plan",
      description: "Create a simple 3-step plan you can use anywhere: in a game, in class, at home.",
      template: "When I feel [emotion], my body does [signal]. I will STOP and [reset move]. Then I will [next action]. My reset word is: [one word].",
      helpText: "Keep this short enough to remember in the heat of the moment.",
    },
    {
      type: "plan",
      title: "Your Composure Challenge",
      prompt: "Describe a time you lost composure. How would you handle it NOW using your Composure Plan?",
      placeholder: "e.g., Last week I slammed my locker after a bad grade. Now I would take 3 breaths, say 'next play,' and ask the teacher what I can improve.",
      completionMessage: "🎉 Module 3 Complete! You've built your personal Composure Plan and Reset Toolkit. Remember: Feel → Pause → Choose → Act. You control your response.",
    },
  ],
};

// ════════════════════════════════════════════════════════════════
// MODULE 3 — High School: "Cognitive Reframing"
// ════════════════════════════════════════════════════════════════
export const module3HS: ModuleExperienceData = {
  moduleNumber: 3,
  moduleTitle: "Cognitive Reframing: Changing the Narrative",
  track: "high",
  screens: [
    {
      type: "hook",
      quote: {
        text: "The mind is everything. What you think, you become.",
        author: "Buddha",
      },
      hookQuestion: "What's a negative thought you've had about yourself after a bad performance — and how long did it stay with you?",
      hookSubtext: "Emotional regulation isn't about suppression. It's about reframing the narrative.",
    },
    {
      type: "workbook",
      title: "Pressure Profile",
      description: "Map your internal dialogue patterns under stress. Be brutally honest.",
      prompts: [
        { label: "The negative thought I repeat most often...", placeholder: "e.g., \"I'm not good enough to start\"" },
        { label: "A thought that sabotages my performance...", placeholder: "e.g., \"Everyone is watching me mess up\"" },
        { label: "How long negative thoughts linger after a mistake...", placeholder: "e.g., The whole game / rest of the day / all week" },
        { label: "What I do when I'm stuck in a negative loop...", placeholder: "e.g., Withdraw, lose intensity, get reckless" },
      ],
    },
    {
      type: "concept",
      title: "The Trigger → Thought → Emotion → Action Cycle",
      description: "Your thoughts create your emotions. Change the thought, change the outcome.",
      layers: [
        { label: "Trigger", description: "External event — bad call, mistake, criticism.", icon: "⚡" },
        { label: "Thought", description: "The story you tell yourself about what happened.", icon: "💭" },
        { label: "Emotion", description: "The feeling produced by your interpretation.", icon: "🔥" },
        { label: "Action", description: "What you do based on the emotion. This is where leadership lives.", icon: "🎯" },
      ],
      insight: "Cognitive Reframing: You can't always change the trigger, but you can ALWAYS change the thought. Stress isn't the enemy — your interpretation of it is.",
    },
    {
      type: "personal",
      title: "Reframe the Narrative",
      description: "For each scenario, write the automatic thought, then reframe it as a leader.",
      categories: [
        { label: "You get pulled from the game", placeholder: "Auto thought: ... → Reframe: ..." },
        { label: "Coach publicly criticizes your effort", placeholder: "Auto thought: ... → Reframe: ..." },
        { label: "You choke in a clutch moment", placeholder: "Auto thought: ... → Reframe: ..." },
        { label: "A teammate outperforms you", placeholder: "Auto thought: ... → Reframe: ...", isHighlighted: true },
      ],
    },
    {
      type: "action",
      title: "Build Your Composure Toolkit",
      description: "Select regulation strategies. You'll narrow to your core composure tools.",
      values: [
        "4-4-6 Breathing", "Eye Focus Reset", "Internal Cue Phrase", "Cognitive Reframe",
        "Body Scan", "Visualization", "Power Pose", "Progressive Muscle Relaxation",
        "Bilateral Tapping", "Cold Water Reset", "Gratitude Redirect", "Mistake Recovery Timeline",
        "Pre-Performance Routine", "Mindful Observation", "Anchor Statement", "Competitive Mini-Drill",
      ],
      steps: [
        { instruction: "Select 6 strategies that fit your style", count: 6 },
        { instruction: "Narrow to your top 3 composure tools", count: 3 },
        { instruction: "Choose your #1 go-to regulation strategy", count: 1 },
      ],
      definitionPrompt: "Build your Mistake Recovery Timeline: What do you do in the first 5 seconds, 30 seconds, and 2 minutes after a mistake?",
    },
    {
      type: "statement",
      title: "Your Game & Exam Composure Plan",
      description: "Create a composure plan that works in both competition and academics.",
      template: "Pre-game identity statement: \"I am [identity].\" When I face [trigger], my reframe is: \"[reframed thought].\" My recovery timeline: 5 sec → [action], 30 sec → [action], 2 min → [action]. My anchor phrase: \"[phrase].\"",
      helpText: "This plan covers competition, exams, and high-pressure life moments.",
    },
    {
      type: "plan",
      title: "Your Reframing Challenge",
      prompt: "Describe a time you lost composure. Rewrite the story using your new Composure Plan.",
      placeholder: "e.g., I got pulled from the game and sulked on the bench. Now: 5 sec → breathe and say 'Calm. Clear. Confident.' 30 sec → watch the game and study the play. 2 min → stand up, cheer, and be ready.",
      completionMessage: "🎉 Module 3 Complete! You now have a Cognitive Reframing toolkit and a Composure Plan. Leaders don't let one moment define the next.",
    },
  ],
};

// ─── Lookup helper ───
export function getModuleExperience(
  moduleNumber: number,
  track: "middle" | "high"
): ModuleExperienceData | undefined {
  const all = [module1MS, module1HS, module2MS, module2HS, module3MS, module3HS];
  return all.find((m) => m.moduleNumber === moduleNumber && m.track === track);
}
