import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createK8sUtilMock } from '../../../utils/test-utils';
import { RevokeAccessModal } from '../RevokeAccessModal';

const k8sDeleteMock = createK8sUtilMock('K8sQueryDeleteResource');

describe('RevokeAccessModal', () => {
  it('should render revoke modal', () => {
    render(
      <RevokeAccessModal
        sbr={{ name: 'test-sbr', namespace: 'test-ns' }}
        username="test-user"
        modalProps={{ isOpen: true }}
      />,
    );
    expect(screen.getByTestId('description').textContent).toBe(
      'The user test-user will lose access to this workspace and all of its applications, environments, and any other dependent items.',
    );
    expect(screen.getByRole('button', { name: 'Revoke' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible();
  });

  it('should delete resource & close modal when revoked', async () => {
    const onClose = jest.fn();
    k8sDeleteMock.mockResolvedValue({});
    render(
      <RevokeAccessModal
        sbr={{ name: 'test-sbr', namespace: 'test-ns' }}
        username="test-user"
        onClose={onClose}
        modalProps={{ isOpen: true }}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Revoke' }));
    await waitFor(() => expect(k8sDeleteMock).toHaveBeenCalled());
    expect(onClose).toHaveBeenCalled();
  });

  it('should show error and not close modal if deletion fails', async () => {
    const onClose = jest.fn();
    k8sDeleteMock.mockRejectedValue(new Error('Unable to delete'));
    render(
      <RevokeAccessModal
        sbr={{ name: 'test-sbr', namespace: 'test-ns' }}
        username="test-user"
        onClose={onClose}
        modalProps={{ isOpen: true }}
      />,
    );
    fireEvent.click(screen.getByText('Revoke'));
    await waitFor(() => expect(screen.getByText('Unable to delete')).toBeVisible());
  });
});
