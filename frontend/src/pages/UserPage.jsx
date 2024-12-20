import UserHeader from "../components/UserHeader";
import useGetUserProfile from "../hooks/useGetUserProfile";


const UserPage = () => {

  const { user } = useGetUserProfile(); //user-ul din link
  console.log(user);

  if (!user) return;
    <h1>User not found</h1>;

  return (
    <>
      <UserHeader user={user}/>
    </>
  );
};

export default UserPage;