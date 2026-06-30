export type ScoreStatus = 'DRAFT' | 'REVIEWED' | 'PUBLISHED';

export interface ScoreDto {
  id: number;
  submissionId: string;

  analyticalRigourScore: number;
  analyticalRigourFeedback: string;

  commercialAcumenScore: number;
  commercialAcumenFeedback: string;

  qualityOfOutputScore: number;
  qualityOfOutputFeedback: string;

  communicationScore: number;
  communicationFeedback: string;

  initiativeOwnershipScore: number;
  initiativeOwnershipFeedback: string;

  totalScore: number;
  status: ScoreStatus;

  // Backend may serialize these as ISO strings or as Jackson's numeric
  // array form ([year, month, day, hour, minute, second, nano]) depending
  // on Jackson config — always read these via utils/date.ts helpers.
  createdAt: string | number[];
  updatedAt: string | number[];
  publishedAt: string | number[] | null;
}

export interface PillarData {
  key: keyof ScoreDto;
  feedbackKey: keyof ScoreDto;
  label: string;
  description: string;
}

export const PILLARS: PillarData[] = [
  {
    key: 'analyticalRigourScore',
    feedbackKey: 'analyticalRigourFeedback',
    label: 'Analytical Rigour',
    description: 'Use of data, evidence, and structured thinking',
  },
  {
    key: 'commercialAcumenScore',
    feedbackKey: 'commercialAcumenFeedback',
    label: 'Commercial Acumen',
    description: 'Business awareness, market understanding, revenue thinking',
  },
  {
    key: 'qualityOfOutputScore',
    feedbackKey: 'qualityOfOutputFeedback',
    label: 'Quality of Output',
    description: 'Thoroughness, professionalism, and completeness of work',
  },
  {
    key: 'communicationScore',
    feedbackKey: 'communicationFeedback',
    label: 'Communication',
    description: 'Clarity, conciseness, and effectiveness of communication',
  },
  {
    key: 'initiativeOwnershipScore',
    feedbackKey: 'initiativeOwnershipFeedback',
    label: 'Initiative & Ownership',
    description: 'Proactiveness, decision-making, and taking responsibility',
  },
];

export interface ApiError {
  error: string;
  message: string;
}
