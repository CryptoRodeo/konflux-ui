import { render } from '@testing-library/react';
import { testTaskRuns } from '../__data__/mock-TaskRun-data';
import TaskRunListRow from '../TaskRunListRow';

jest.mock('react-router-dom', () => ({
  Link: (props) => <a href={props.to}>{props.children}</a>,
}));

describe('TaskRunListRow', () => {
  it('should render task info', () => {
    const wrapper = render(<TaskRunListRow obj={testTaskRuns[0]} columns={[]} />, {
      container: document.createElement('tr'),
    });
    const cells = wrapper.container.getElementsByTagName('td');
    const status = wrapper.getAllByTestId('taskrun-status');

    expect(cells[0].children[0].innerHTML).toBe(testTaskRuns[0].metadata.name);
    expect(cells[1].innerHTML).toBe(testTaskRuns[0].spec.taskRef.name);
    expect(status[0].innerHTML).toBe('Failed');
  });
});
