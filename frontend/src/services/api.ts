import axios from 'axios';
import { ScoreDto, ApiError } from '../types';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

export const getAllScores = async (): Promise<ScoreDto[]> => {
  const res = await api.get<ScoreDto[]>('/scores');
  return res.data;
};

export const getPublishedScores = async (): Promise<ScoreDto[]> => {
  const res = await api.get<ScoreDto[]>('/scores/published');
  return res.data;
};

export const generateScore = async (
  submissionId: string,
  submissionText: string
): Promise<ScoreDto> => {
  const res = await api.post<ScoreDto>('/scores/generate', {
    submissionId,
    submissionText,
  });
  return res.data;
};

export const getScore = async (scoreId: number): Promise<ScoreDto> => {
  const res = await api.get<ScoreDto>(`/scores/${scoreId}`);
  return res.data;
};

export const getScoreBySubmission = async (
  submissionId: string
): Promise<ScoreDto> => {
  const res = await api.get<ScoreDto>(`/scores/submission/${submissionId}`);
  return res.data;
};

export const updateScore = async (
  scoreId: number,
  updates: Partial<ScoreDto>
): Promise<ScoreDto> => {
  const res = await api.put<ScoreDto>(`/scores/${scoreId}`, updates);
  return res.data;
};

export const publishScore = async (scoreId: number): Promise<ScoreDto> => {
  const res = await api.post<ScoreDto>(`/scores/${scoreId}/publish`);
  return res.data;
};

// Axios error helper
export const extractErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error) && error.response?.data) {
    const data = error.response.data as ApiError;
    return data.message || 'An unexpected error occurred';
  }
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred';
};

export const isLockedError = (error: unknown): boolean => {
  if (axios.isAxiosError(error) && error.response?.data) {
    const data = error.response.data as ApiError;
    return data.error === 'LOCKED';
  }
  return false;
};
