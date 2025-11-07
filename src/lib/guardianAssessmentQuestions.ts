// Guardian Assessment Questions (Parent/Guardian perspective)
// These questions are designed for parents/guardians to assess the athlete

export interface GuardianQuestion {
  id: string;
  domain: string;
  text: string;
}

export const guardianQuestions: GuardianQuestion[] = [
  // Leadership DNA (L)
  {
    id: 'l1',
    domain: 'Leadership DNA',
    text: 'My child/athlete demonstrates emotional maturity and self-control during stressful situations.',
  },
  {
    id: 'l2',
    domain: 'Leadership DNA',
    text: 'They take initiative to help others without needing recognition.',
  },
  {
    id: 'l3',
    domain: 'Leadership DNA',
    text: 'They are honest and willing to admit when they make mistakes.',
  },
  
  // Excellence (E)
  {
    id: 'e1',
    domain: 'Excellence',
    text: 'My child/athlete is consistently prepared and organized for their commitments.',
  },
  {
    id: 'e2',
    domain: 'Excellence',
    text: 'They maintain high personal standards even when others don\'t.',
  },
  {
    id: 'e3',
    domain: 'Excellence',
    text: 'They actively seek feedback and use it to improve.',
  },
  
  // Accountability (A)
  {
    id: 'a1',
    domain: 'Accountability',
    text: 'My child/athlete takes ownership of their responsibilities without making excuses.',
  },
  {
    id: 'a2',
    domain: 'Accountability',
    text: 'They keep their commitments reliably (practices, homework, family obligations).',
  },
  {
    id: 'a3',
    domain: 'Accountability',
    text: 'They hold themselves accountable and accept constructive criticism well.',
  },
  
  // Discipline (D)
  {
    id: 'd1',
    domain: 'Discipline',
    text: 'My child/athlete shows consistent work ethic across all areas of life.',
  },
  {
    id: 'd2',
    domain: 'Discipline',
    text: 'They demonstrate self-control and manage their emotions appropriately.',
  },
  {
    id: 'd3',
    domain: 'Discipline',
    text: 'They can refocus and recover quickly after setbacks or disappointments.',
  },
  
  // Belonging (B)
  {
    id: 'b1',
    domain: 'Belonging',
    text: 'My child/athlete treats all people with respect, regardless of background or status.',
  },
  {
    id: 'b2',
    domain: 'Belonging',
    text: 'They celebrate others\' success without jealousy.',
  },
  {
    id: 'b3',
    domain: 'Belonging',
    text: 'They positively contribute to team/family culture through their behavior and attitude.',
  },
];

export const guardianDomainDescriptions = {
  'Leadership DNA': 'Character traits that form the foundation of effective leadership',
  'Excellence': 'Commitment to high standards and continuous improvement',
  'Accountability': 'Taking ownership of actions and responsibilities',
  'Discipline': 'Consistency, self-control, and resilience',
  'Belonging': 'Creating inclusive environments and positive relationships',
};
