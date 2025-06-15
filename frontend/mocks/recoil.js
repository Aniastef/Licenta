export const useRecoilValue = (atom) => {
  if (atom.key === 'userAtom') {
    return { _id: 'mockUserId123', firstName: 'Test', lastName: 'User' }; // Return a mock user
  }
  return null;
};

export const atom = jest.fn();
export const selector = jest.fn();
