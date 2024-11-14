import { render } from '@testing-library/react';
import { handleURLs } from '../render-utils';

describe('handleURLs', () => {
  it('should return the same value if it is not a string', () => {
    // We will only likely get strings, but it shouldn't break/NPE if they are not
    expect(handleURLs(null)).toBe(null);
    expect(handleURLs(undefined)).toBe(undefined);
    // @ts-expect-error We will only likely get strings, but it shouldn't break/NPE if they are not
    expect(handleURLs(true)).toBe(true);
    const v = {};
    // @ts-expect-error We will only likely get strings, but it shouldn't break/NPE if they are not
    expect(handleURLs(v)).toBe(v);
  });

  it('should not do anything if there are no URLs in the string', () => {
    const stringsWithoutURLs = ['not a URL', 'redhat.com', 'http', '://something.com'];
    stringsWithoutURLs.forEach((string: string) => {
      expect(handleURLs(string)).toBe(string);
    });
  });

  describe('Test easy URL Examples', () => {
    const validStringsWithURL: { [testName: string]: string } = {
      straightURL: 'https://redhat.com',
      prefixedURL: 'Red Hat website: https://redhat.com',
      suffixedURL: "https://redhat.com is Red Hat's website",
      bothPrefixAndSuffixURL: 'This is the company website https://redhat.com for Red Hat',
    };

    Object.keys(validStringsWithURL).forEach((testName: string) => {
      const string = validStringsWithURL[testName];
      it(`should create a link for the URL, test ${testName}`, () => {
        const reactRendering = handleURLs(string);
        expect(typeof reactRendering).not.toBe('string');
        const renderResult = render(<div>{reactRendering}</div>);
        const link = renderResult.getByRole('link');
        expect(link.getAttribute('href')).toBe('https://redhat.com');
        expect(link.textContent).toBe('https://redhat.com');
      });
    });
  });

  describe('Test edge-case URL Examples', () => {
    it('should create multiple ExternalLinks and not lose the interim prefix/suffix values', () => {
      const data =
        'some prefix https://github.com/openshift/console some middle http://example.com some suffix';
      const result = handleURLs(data);
      const renderResult = render(<div>{result}</div>);
      const links = renderResult.getAllByRole('link');
      expect(links).toHaveLength(2);
      expect(renderResult.container.textContent).toEqual(data);
    });

    it('should create multiple ExternalLinks when more than one url is present', () => {
      const links = [
        'https://github.com/openshift/console',
        'https://github.com/openshift/api',
        'https://github.com/openshift/kubernetes',
        'https://github.com/openshift/origin',
        'https://github.com/openshift/release',
      ];
      const data = links.join(' '); // join multiple links together with a space (so they are unique urls);
      const result = handleURLs(data);
      const renderResult = render(<div>{result}</div>);
      expect(renderResult.getAllByRole('link')).toHaveLength(links.length);
    });

    it('should handle escaped URLs (such as googling for a URL)', () => {
      // Google for 'https://github.com/openshift/console'
      const data =
        'https://www.google.com/search?q=https%3A%2F%2Fgithub.com%2Fopenshift%2Fconsole&ei=SO5lYNXrK_Ox5NoPwN-soAw&oq=https%3A%2F%2Fgithub.com%2Fopenshift%2Fconsole&gs_lcp=Cgdnd3Mtd2l6EAM6BwgAEEcQsAM6BwgAELADEEM6DgguEMcBEK8BEJECEJMCOgsILhDHARCvARCRAjoICAAQsQMQgwE6DgguELEDEIMBEMcBEKMCOgUIABCxAzoLCC4QsQMQxwEQowI6AggAOgQIABBDOgcIABCxAxBDOgQIABAKOgYIABAWEB5QlzVYmKYBYJ2nAWgCcAJ4AIABbYgBvBmSAQQzMy40mAEAoAEBqgEHZ3dzLXdpesgBCsABAQ&sclient=gws-wiz&ved=0ahUKEwjVr7S5td3vAhXzGFkFHcAvC8QQ4dUDCA0&uact=5';
      const result = handleURLs(data);
      const renderResult = render(<div>{result}</div>);
      expect(renderResult.getAllByRole('link')).toHaveLength(1);
    });

    it('should handle redirect wrapper URLs', () => {
      // Probably not a common case, but some sites wrap all links by a query param at the end of the URL
      const data = 'https://github.com/openshift?externalLink=https://github.com/openshift/console';
      const result = handleURLs(data);
      const renderResult = render(<div>{result}</div>);
      expect(renderResult.getAllByRole('link')).toHaveLength(1);
    });
  });
});
