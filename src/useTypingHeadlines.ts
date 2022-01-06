import { useEffect, useMemo, useState } from 'react';

const STRING_DELIMITER = '\0';

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

const useTypingHeadlines = (
  headlines: string[],
  options: Partial<TypingHeadlinesOptions> = {},
) => {
  const {
    isStatic = false,
    showHeadlineInitially = true,
    headlineInterval = 4000,
    letterInterval = 50,
  } = options;

  // Make headline argument stable
  const headlinesAsString = headlines.join(STRING_DELIMITER);
  const headlinesMemo = useMemo(() =>
    headlinesAsString.split(STRING_DELIMITER)
  , [headlinesAsString]);
  
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
      setAnimationTarget(undefined), headlineInterval);
    return () => clearInterval(interval);
  }, [headlineInterval]);

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

export default useTypingHeadlines;