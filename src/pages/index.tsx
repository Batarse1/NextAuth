import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";

const SignIn = () => (
  <>
    <p>
      Not signed in <br />
    </p>
    <button onClick={() => signIn()}>Sign in</button> <br />
  </>
);

const SignOut = ({ email }: { email: string | null | undefined }) => (
  <>
    {email && (
      <p>
        Signed in as {email} <br />
      </p>
    )}
    <button onClick={() => signOut()}>Sign out</button> <br />
  </>
);

const Home = () => {
  const { data: session } = useSession();
  const email = session && session.user ? session.user.email : null;

  return (
    <main>
      {session ? <SignOut email={email} /> : <SignIn />}
      <Link href={"/protected"}>Protected</Link>
    </main>
  );
};

export default Home;
