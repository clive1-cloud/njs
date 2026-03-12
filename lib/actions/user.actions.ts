'use server'
import {signIn, signOut} from '@/auth'
import { IUserSignin, IUserSignUP, IUserInput } from '@/types'
import { redirect } from 'next/navigation'
import { connectToDatabase } from '../db'
import bcrypt from 'bcryptjs'
import { formatError } from '../utils'
import User, { IUser } from '../db/models/user.model'
import { UserSignUpSchema } from '../validator'


export async function signInWithCredentials(user: IUserSignin) {
    return await signIn('credentials', {...user,redirect: false})
}

export const Signout = async () => {
    const redirectTo = await signOut({ redirect: false})
    redirect(redirectTo.redirect)
}

export async function registerUser(userSignUp: IUserSignUP) {
  try {
    const user = await UserSignUpSchema.parseAsync({
      name: userSignUp.name,
      email: userSignUp.email,
      password: userSignUp.password,
      confirmPassword: userSignUp.confirmPassword,
    })

    await connectToDatabase()
    await User.create({
      ...user,
      password: await bcrypt.hash(user.password, 5),
    })
    return { success: true, message: 'User created successfully' }
  } catch (error) {
    return { success: false, error: formatError(error) }
  }
}
