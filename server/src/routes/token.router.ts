import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();

const ROLE_PERMISSIONS: Record<string, string[]> = {
  ADMIN:   ['READ', 'WRITE', 'DELETE'],
  WRITER:  ['READ', 'WRITE'],
  VISITOR: ['READ'],
};

/**
 * @swagger
 * /token:
 *   post:
 *     summary: Issue a JWT for a given role
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [ADMIN, WRITER, VISITOR]
 *     responses:
 *       200:
 *         description: JWT token issued
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       400:
 *         description: Invalid role
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.post('/', (req: Request, res: Response): void => {
  const { role } = req.body;

  if (!role || !ROLE_PERMISSIONS[role]) {
    res.status(400).json({ error: 'Invalid role' });
    return;
  }

  const permissions = ROLE_PERMISSIONS[role];
  const token = jwt.sign(
    { role, permissions },
    process.env.JWT_SECRET as string,
    { expiresIn: process.env.JWT_EXPIRES_IN ?? '60s' } as jwt.SignOptions
  );

  res.json({ token });
});

export default router;
