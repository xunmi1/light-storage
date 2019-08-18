/**
 * @jest-environment node
 */
import LightStorage from '../src/main';

test('env isn\'t browser', () => {
  const errorHandler = () => new LightStorage('node');
  expect(errorHandler).toThrowError(TypeError);
});
