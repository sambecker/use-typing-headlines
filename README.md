# 💻 useTypingHeadlines

React hook designed to display animated headlines

## Installation (coming soon!)

```
npm i use-typing-headlines
```

## Usage

### One headline

```tsx
const [headline] = useTypingHeadlines([
  'First you see this',
  'Then you see this',
  'Lastly, this',
]);

return <h1>{headline}</h1>;
```

### Multiple headlines

```tsx
const [headlineOne] = useTypingHeadlines([
  'Peanut Butter',
  'Copy',
  'Barb',
]);

const [headlineTwo] = useTypingHeadlines([
  'Jelly',
  'Paste',
  'Star',
]);

return <h1>
  {headlineOne} &amp;
  {headlineTwo}<span style={{ visibility: 'hidden' }}>_</span>
</h1>;
```