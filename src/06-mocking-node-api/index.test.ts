import fs from 'node:fs';
import path from 'node:path';
import { doStuffByTimeout, doStuffByInterval, readFileAsynchronously } from '.';

const TIMEOUT = 1000;

describe('doStuffByTimeout', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    jest.spyOn(global, 'setTimeout');
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  test('should set timeout with provided callback and timeout', () => {
    const cb = jest.fn();

    doStuffByTimeout(cb, TIMEOUT);
    expect(setTimeout).toHaveBeenCalledWith(cb, TIMEOUT);
  });

  test('should call callback only after timeout', () => {
    const cb = jest.fn();

    doStuffByTimeout(cb, TIMEOUT);
    expect(cb).not.toHaveBeenCalled();

    jest.runOnlyPendingTimers();
    expect(cb).toHaveBeenCalledTimes(1);
  });
});

describe('doStuffByInterval', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    jest.spyOn(global, 'setInterval');
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  test('should set interval with provided callback and timeout', () => {
    const cb = jest.fn();

    doStuffByInterval(cb, TIMEOUT);
    expect(setInterval).toHaveBeenCalledWith(cb, TIMEOUT);
  });

  test('should call callback multiple times after multiple intervals', () => {
    const cb = jest.fn();

    doStuffByInterval(cb, TIMEOUT);
    expect(cb).toHaveBeenCalledTimes(0);
    jest.advanceTimersByTime(TIMEOUT);
    expect(cb).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(TIMEOUT);
    expect(cb).toHaveBeenCalledTimes(2);
    jest.advanceTimersByTime(TIMEOUT);
    expect(cb).toHaveBeenCalledTimes(3);
  });
});

describe('readFileAsynchronously', () => {
  beforeEach(() => {
    jest.spyOn(path, 'join');
  });

  test('should call join with pathToFile', async () => {
    await readFileAsynchronously('./file.txt');
    expect(path.join).toHaveBeenCalledWith(expect.any(String), './file.txt');
  });

  test('should return null if file does not exist', async () => {
    jest.spyOn(fs, 'existsSync').mockReturnValueOnce(false);

    const result = await readFileAsynchronously('./file.txt');
    expect(result).toBeNull();
  });

  test('should return file content if file exists', async () => {
    const fileContent = 'Some text innformation';

    jest
      .spyOn(fs.promises, 'readFile')
      .mockResolvedValue(Buffer.from(fileContent, 'utf8'));
    jest.spyOn(fs, 'existsSync').mockReturnValueOnce(true);

    const result = await readFileAsynchronously('./file.txt');
    expect(result).toBe(fileContent);
  });
});
