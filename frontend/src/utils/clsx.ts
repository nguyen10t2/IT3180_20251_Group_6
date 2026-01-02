// Clsx is required for cn utility
export function clsx(...inputs: any[]) {
  return inputs
    .flat()
    .filter((x) => typeof x === 'string' || typeof x === 'number')
    .join(' ')
    .trim();
}
