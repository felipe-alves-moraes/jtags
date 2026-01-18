import { expect } from '@esm-bundle/chai';

describe('Test Infrastructure', () => {
  it('should run a basic test', () => {
    expect(1 + 1).to.equal(2);
  });

  it('should have access to DOM APIs', () => {
    const div = document.createElement('div');
    div.textContent = 'Hello';
    expect(div.textContent).to.equal('Hello');
  });

  it('should support async tests', async () => {
    const result = await Promise.resolve('async works');
    expect(result).to.equal('async works');
  });
});
