import { prisma } from "@/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

const signUp = async (data: FormData) => {
  "use server";
  const email = data.get("email") as string;
  const password = data.get("password") as string;
  const name = data.get("name") as string;
  //hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  //create user in Db
  await prisma.user.create({ data: { email, name, password: hashedPassword } });
  // redirect to login after signUp
  redirect("/Login");
};

const SignUpPage = () => {
  return (
    <div>
      <div>
        <h1>
          <form action={signUp}>
            <div>
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="mt-1 block w-full px-3 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-100  focus:border-blue-500"
              ></input>
              <div>
                <label htmlFor="email"></label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="mt-1 block w-full px-3 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-100  focus:border-blue-500"
                ></input>
              </div>
              <div>
                <label htmlFor="password"></label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  minLength={6}
                  required
                  className="mt-1 block w-full px-3 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-100  focus:border-blue-500"
                ></input>
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-green-doo text-black py-2 rounded-md "
            >
              {" "}
            </button>
          </form>
        </h1>
      </div>
    </div>
  );
};
export default SignUpPage;
