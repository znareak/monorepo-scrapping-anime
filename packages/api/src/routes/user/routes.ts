import { getUser, signin, signup, updateUser } from './controllers'
import { validateUser, validateUserUpdate } from '../../validators/users'
import { Router } from 'express'
const router = Router()

router.get('/', getUser)
router.put('/', validateUserUpdate, updateUser)
router.post('/signup', validateUser, signup)
router.post('/signin', validateUser, signin)

export default router
