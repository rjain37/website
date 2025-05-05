import { useRouter } from "next/router";
import NavBar from "@/components/NavBar";
import Head from "next/head";
import Link from "next/link";

export default function Error() {
  const router = useRouter();
  const { error } = router.query;

  const errors: { [key: string]: string } = {
    default: "An error occurred during authentication.",
    AccessDenied: "You do not have permission to access this site.",
    Verification: "The verification link is invalid or has expired.",
    Configuration: "There is a problem with the server configuration.",
    OAuthSignin: "Error in the OAuth sign-in process.",
    OAuthCallback: "Error in the OAuth callback process.",
    OAuthCreateAccount: "Could not create an OAuth provider account.",
    EmailCreateAccount: "Could not create an email provider account.",
    Callback: "Error in the callback process.",
    OAuthAccountNotLinked: "The email associated with this sign-in is already linked to another account.",
    EmailSignin: "Error sending the email sign-in link.",
    CredentialsSignin: "The sign-in credentials are invalid."
  };

  const errorMessage = error && Object.keys(errors).includes(error as string)
    ? errors[error as string]
    : errors.default;

  return (
    <>
      <Head>
        <title>Authentication Error</title>
      </Head>
      <NavBar />
      <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-dark-900">
        <div className="mx-auto max-w-md px-4 py-8 text-center">
          <h1 className="mb-4 text-3xl font-bold text-red-600 dark:text-red-400">Authentication Error</h1>
          <p className="mb-6 text-gray-700 dark:text-gray-300">{errorMessage}</p>
          <div className="flex justify-center gap-4">
            <Link href="/auth/signin">
              <div className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                Try Again
              </div>
            </Link>
            <Link href="/">
              <div className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                Go Home
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
