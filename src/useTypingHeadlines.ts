import { useEffect, useMemo, useState } from 'react';

const STRING_DELIMITER = '\0';

const DEFAULT_HEADLINE_INTERVAL = 4000;
const DEFAULT_LETTER_INTERVAL = 50;

export interface TypingHeadlinesOptions {
  // Only display the initial headline, unanimated
  isStatic: boolean,
  // Start with complete text or no text
  showHeadlineInitially: boolean
  // How long before headlines change, default: 4000ms
  headlineInterval: number
  // How long before characters change, default: 50ms
  letterInterval: number
}

export type TypingHeadlinesReturnType = [
  headlineLive: string,
  headlineStatic: string,
  headlineInitial: string,
];

export const useTypingHeadlines = (
  headlines: string[],
  options: Partial<TypingHeadlinesOptions> = {},
): TypingHeadlinesReturnType => {
  const {
    isStatic = false,
    showHeadlineInitially = true,
    headlineInterval = DEFAULT_HEADLINE_INTERVAL,
    letterInterval = DEFAULT_LETTER_INTERVAL,
  } = options;

  // Make headline argument stable
  const headlinesAsString = headlines.join(STRING_DELIMITER);
  const headlinesMemo = useMemo(() =>
    headlinesAsString.split(STRING_DELIMITER)
  , [headlinesAsString]);

  // Keep track of longest headline
  // to prevent premature headline changes
  const longestHeadlineLength = useMemo(() =>
    headlinesMemo.reduce((longest, headline) =>
      headline.length > longest ? headline.length : longest, 0)
  , [headlinesMemo]);
  const headlineIntervalMinimum = Math.max(
    headlineInterval,
    longestHeadlineLength * letterInterval + 2 * letterInterval,
  );
  
  // Default headline when 'isStatic' set to 'true'
  // or user prefers reduced motion
  const headlineInitial = headlines[0];

  const [index, setIndex] = useState(0);

  const [headlineStatic, setHeadlineStatic] = useState(headlines[0]);
  const [headlineLive, setHeadlineLive] = useState(showHeadlineInitially
    ? headlines[0]
    : ''
  );

  const [animationTarget, setAnimationTarget] = useState(showHeadlineInitially
    ? undefined
    : headlineLive);

  // Cycle headlines independent of character animation
  // to keep in sync with other instances of `useTypingHeadlines`
  useEffect(() => {
    const interval = setInterval(() =>
      setAnimationTarget(undefined), headlineIntervalMinimum);
    return () => clearInterval(interval);
  }, [headlineIntervalMinimum]);

  // Update animation target and static headline
  // every time index changes
  useEffect(() => {
    setAnimationTarget(headlinesMemo[index]);
    setHeadlineStatic(headlinesMemo[index]);
  }, [headlinesMemo, index]);

  useEffect(() => {
    if (!isStatic) {
      const interval = setInterval(() => {
        if (animationTarget) {
          setHeadlineLive(current => {
            if (current.length < animationTarget.length) {
              return current + animationTarget[current.length];
            } else {
              clearInterval(interval);
              return animationTarget;
            }
          });
        } else {
          setHeadlineLive(current => {
            if (current.length > 0) {
              return current.slice(0, -1);
            } else {
              clearInterval(interval);
              setIndex(i => i < headlines.length - 1 ? i + 1 : 0);
              return '';
            }
          });
        }
      }, letterInterval);
      return () => clearInterval(interval);
    } else {
      setHeadlineLive(headlineInitial);
    }
  }, [
    isStatic,
    headlines.length,
    animationTarget,
    letterInterval,
    headlineInitial,
  ]);

  return [
    headlineLive,
    headlineStatic,
    headlineInitial,
  ];
};