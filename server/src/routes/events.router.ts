import { Router, Request, Response } from 'express';
import { requireAuth, requirePermission } from '../middleware/auth';
import { paginate } from '../middleware/paginate';
import * as store from '../store/events.store';

const router = Router();

/**
 * @swagger
 * /api/v1/events:
 *   get:
 *     summary: Get all events (paginated)
 *     tags: [Events]
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
 *         description: Paginated list of events
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Event' }
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
 * /api/v1/events/{id}:
 *   get:
 *     summary: Get an event by ID
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Event found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Event' }
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
 * /api/v1/events:
 *   post:
 *     summary: Create an event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Event' }
 *     responses:
 *       201:
 *         description: Event created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Event' }
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
 * /api/v1/events/{id}:
 *   put:
 *     summary: Update an event
 *     tags: [Events]
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
 *           schema: { $ref: '#/components/schemas/Event' }
 *     responses:
 *       200:
 *         description: Event updated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Event' }
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
 * /api/v1/events/{id}:
 *   delete:
 *     summary: Delete an event
 *     tags: [Events]
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
 *     Event:
 *       type: object
 *       properties:
 *         id:       { type: string }
 *         title:    { type: string }
 *         type:     { type: string, enum: [Test, Quiz, Assignment, Deadline] }
 *         date:     { type: string, format: date, example: '2026-05-20' }
 *         courseId: { type: string }
 */

export default router;
