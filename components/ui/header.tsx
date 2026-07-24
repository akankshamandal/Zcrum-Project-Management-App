import { Show, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { PenBox } from "lucide-react";
import UserMenu from "./user-menu";
import { checkUser } from "@/lib/checkUser";
import UserLoading from "./user-loading";
const Header = async () => {
  await checkUser();
  return (
    <header className="container mx-auto">
      <nav className="py-6 px-4 flex justify-between items-center">
        <Link href="/">
          <Image
            src="/Logo2.png"
            alt="Zcrum Logo"
            width={200}
            height={56}
            className="h-10 w-auto object-contain"
          />
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/project/create">
            <Button variant="destructive" className="flex items-center gap-2">
              <PenBox size={18} />
              <span>Create Project</span>
            </Button>
          </Link>

          <Show when="signed-out">
            <SignInButton forceRedirectUrl="/onboarding">
              <Button variant="outline">Login</Button>
            </SignInButton>
          </Show>

          <Show when="signed-in">
            <UserMenu />
          </Show>
        </div>
      </nav>
      <UserLoading/>
    </header>
  );
};

export default Header;