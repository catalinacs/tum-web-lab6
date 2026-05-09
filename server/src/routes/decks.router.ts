import { Router, Request, Response } from 'express';
import { requireAuth, requirePermission } from '../middleware/auth';
import { paginate } from '../middleware/paginate';
import * as store from '../store/decks.store';

const router = Router();

/**
 * @swagger
 * /api/v1/decks:
 *   get:
 *     summary: Get all decks (paginated)
 *     tags: [Decks]
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
 *         description: Paginated list of decks
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Deck' }
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
 * /api/v1/decks/{id}:
 *   get:
 *     summary: Get a deck by ID
 *     tags: [Decks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Deck found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Deck' }
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
 * /api/v1/decks:
 *   post:
 *     summary: Create a deck
 *     tags: [Decks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Deck' }
 *     responses:
 *       201:
 *         description: Deck created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Deck' }
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
 * /api/v1/decks/{id}:
 *   put:
 *     summary: Update a deck
 *     tags: [Decks]
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
 *           schema: { $ref: '#/components/schemas/Deck' }
 *     responses:
 *       200:
 *         description: Deck updated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Deck' }
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
 * /api/v1/decks/{id}:
 *   delete:
 *     summary: Delete a deck
 *     tags: [Decks]
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
 *     Card:
 *       type: object
 *       properties:
 *         id:       { type: string }
 *         question: { type: string }
 *         answer:   { type: string }
 *     Deck:
 *       type: object
 *       properties:
 *         id:       { type: string }
 *         name:     { type: string }
 *         courseId: { type: string, nullable: true }
 *         cards:
 *           type: array
 *           items: { $ref: '#/components/schemas/Card' }
 */

export default router;
