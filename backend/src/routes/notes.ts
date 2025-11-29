import express from 'express';
import { authenticateToken, requireFamilyMember } from '../middleware/auth';
import { NotesController } from '../controllers/NotesController';

const router = express.Router();

router.use(authenticateToken);
router.use(requireFamilyMember);

router.get('/', NotesController.list);
router.post('/', NotesController.create);
router.put('/:id', NotesController.update);
router.delete('/:id', NotesController.remove);

export default router;


