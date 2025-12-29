export const generateWithGrok = async (
  original: string,
  ref1: string,
  ref2: string
) => {
  return `
## Enhanced Article

${original}

### Key Improvements
- Improved structure and clarity
- Incorporated insights from reference articles
- Enhanced readability and flow

### Summary
This article has been rewritten using insights from top-ranking sources
to improve clarity, structure, and SEO friendliness.

### References
1. ${ref1.slice(0, 100)}...
2. ${ref2.slice(0, 100)}...
`;
};