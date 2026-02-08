import { jest } from '@jest/globals';

describe('backfill-to-json script', () => {
  it('parses and updates socialActivity and userSettings', async () => {
    const socialRows = [
      { id: 'a1', data: '{"foo":true}' },
      { id: 'a2', data: 'tag1,tag2' },
    ];
    const settingsRows = [
      { id: 's1', assessmentLearningGoals: '["goal1","goal2"]' },
      { id: 's2', assessmentLearningGoals: 'goalA,goalB' },
    ];

    const mockSocialUpdate = jest.fn().mockResolvedValue(true);
    const mockSettingsUpdate = jest.fn().mockResolvedValue(true);
    const mockPrisma = {
      socialActivity: {
        findMany: jest.fn().mockResolvedValue(socialRows),
        update: mockSocialUpdate,
      },
      userSettings: {
        findMany: jest.fn().mockResolvedValue(settingsRows),
        update: mockSettingsUpdate,
      },
      $disconnect: jest.fn().mockResolvedValue(undefined),
    } as any;

    // Mock @prisma/client PrismaClient
    jest.unstable_mockModule('@prisma/client', () => ({ PrismaClient: jest.fn(() => mockPrisma) }));

    // Import the script after mocking
    const { default: run } = await import('../../scripts/backfill-to-json.js');

    // Wait briefly to allow the script to run if it executes on import
    await new Promise((r) => setTimeout(r, 50));

    // Assert update calls were made
    expect(mockSocialUpdate).toHaveBeenCalled();
    expect(mockSettingsUpdate).toHaveBeenCalled();
  });
});
