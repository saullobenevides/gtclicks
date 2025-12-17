import { slugify } from '../slug';

describe('slugify', () => {
  it('should convert text to lowercase', () => {
    expect(slugify('Hello')).toBe('hello');
  });

  it('should replace spaces with dashes', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('should remove special characters', () => {
    expect(slugify('Hello, World!')).toBe('hello-world');
  });

  it('should normalize accents', () => {
    expect(slugify('Olá Mundo')).toBe('ola-mundo');
  });

  it('should handle empty input', () => {
    expect(slugify('')).toContain('slug-'); // Expect fallback timestamp
  });

  it('should handle undefined input', () => {
    expect(slugify(undefined)).toContain('slug-');
  });
});
