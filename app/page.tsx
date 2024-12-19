import { validateRequest } from "./auth/lucia";
import Link from "next/link";
import { ProjectList } from "@/app/components/ProjectList";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default async function Home() {
  const { user } = await validateRequest();

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center">
        <h1 className="text-8xl font-bold mb-4">Builder</h1>
        <p className="text-xl mb-8 text-center">
          Plan your next great project. Create tasks, save configurations, and get more done faster.
        </p>
        <Card className="grid p-8 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-semibold mb-4 mx-auto items-center">Login</h2>
          <Link
            href="/api/auth/login/github"
            className="bg-gray-800 text-white px-4 py-2 rounded flex items-center justify-center"
          >
            Sign in with GitHub
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Project Dashboard</h1>
        <div className="flex items-center">
          <p className="mr-4">Signed in as {user.username}</p>
          <form action="/api/auth/logout" method="post">
            <Button type="submit" variant="destructive">
              Sign out
            </Button>
          </form>
        </div>
      </div>
      <ProjectList />
    </div>
  );
}