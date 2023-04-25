import { getSession, GetSessionParams, useSession } from "next-auth/react";
import Link from "next/link";

const Protected = () => {
  const { data: session } = useSession({ required: true });

  if (!session) return <div>You are not signed in.</div>;

  return (
    <div>
      <h1>Protected Page</h1>
      <p>Only accessible to authenticated users</p>
      <p>Session: {JSON.stringify(session, null, 2)}</p>
      <Link href={"/"}>Home</Link>
    </div>
  );
};

export const getServerSideProps = async (
  context: GetSessionParams | undefined
) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/",
      },
    };
  }

  return {
    props: { session },
  };
};

export default Protected;
