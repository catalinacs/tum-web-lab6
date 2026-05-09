import { Router, Request, Response } from 'express';
import { requireAuth, requirePermission } from '../middleware/auth';
import { paginate } from '../middleware/paginate';
import * as store from '../store/sessions.store';

const router = Router();

/**
 * @swagger
 * /api/v1/sessions:
 *   get:
 *     summary: Get all sessions (paginated)
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10, minimum: 0, maximum: 100 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, default: 0, minimum: 0 }
 *     responses:
 *       200:
 *         description: Paginated list of sessions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Session' }
 *                 total:   { type: integer }
 *                 limit:   { type: integer }
 *                 offset:  { type: integer }
 *                 hasMore: { type: boolean }
 *       400:
 *         description: Invalid pagination params
 *       401:
 *         description: Unauthorized
 */
router.get('/', requireAuth, requirePermission('READ'), (req: Request, res: Response) => {
  const result = paginate(req, res, store.getAll());
  if (result) res.json(result);
});

/**
 * @swagger
 * /api/v1/sessions/{id}:
 *   get:
 *     summary: Get a session by ID
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Session found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Session' }
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
router.get('/:id', requireAuth, requirePermission('READ'), (req: Request, res: Response) => {
  const item = store.getById(req.params.id);
  if (!item) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(item);
});

/**
 * @swagger
 * /api/v1/sessions:
 *   post:
 *     summary: Create a session
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Session' }
 *     responses:
 *       201:
 *         description: Session created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Session' }
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/', requireAuth, requirePermission('WRITE'), (req: Request, res: Response) => {
  const item = store.create(req.body);
  res.status(201).json(item);
});

/**
 * @swagger
 * /api/v1/sessions/{id}:
 *   put:
 *     summary: Update a session
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Session' }
 *     responses:
 *       200:
 *         description: Session updated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Session' }
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
router.put('/:id', requireAuth, requirePermission('WRITE'), (req: Request, res: Response) => {
  const item = store.update(req.params.id, req.body);
  if (!item) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(item);
});

/**
 * @swagger
 * /api/v1/sessions/{id}:
 *   delete:
 *     summary: Delete a session
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
router.delete('/:id', requireAuth, requirePermission('DELETE'), (req: Request, res: Response) => {
  const ok = store.remove(req.params.id);
  if (!ok) { res.status(404).json({ error: 'Not found' }); return; }
  res.status(204).send();
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Session:
 *       type: object
 *       properties:
 *         id:          { type: string }
 *         courseId:    { type: string }
 *         duration:    { type: integer, description: Duration in minutes }
 *         completedAt: { type: string, format: date-time }
 */

export default router;
