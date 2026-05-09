import { Router, Request, Response } from 'express';
import { requireAuth, requirePermission } from '../middleware/auth';
import { paginate } from '../middleware/paginate';
import * as store from '../store/courses.store';

const router = Router();

/**
 * @swagger
 * /api/v1/courses:
 *   get:
 *     summary: Get all courses (paginated)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10, minimum: 0, maximum: 100 }
 *         description: Max items to return
 *       - in: query
 *         name: offset
 *         schema: { type: integer, default: 0, minimum: 0 }
 *         description: Number of items to skip
 *     responses:
 *       200:
 *         description: Paginated list of courses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Course'
 *                 total:   { type: integer }
 *                 limit:   { type: integer }
 *                 offset:  { type: integer }
 *                 hasMore: { type: boolean }
 *       400:
 *         description: Invalid pagination params
 *       401:
 *         description: No token or expired
 *       403:
 *         description: Invalid token or insufficient permissions
 */
router.get('/', requireAuth, requirePermission('READ'), (req: Request, res: Response) => {
  const result = paginate(req, res, store.getAll());
  if (result) res.json(result);
});

/**
 * @swagger
 * /api/v1/courses/{id}:
 *   get:
 *     summary: Get a course by ID
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Course found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Course' }
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
 * /api/v1/courses:
 *   post:
 *     summary: Create a course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Course' }
 *     responses:
 *       201:
 *         description: Course created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Course' }
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
 * /api/v1/courses/{id}:
 *   put:
 *     summary: Update a course
 *     tags: [Courses]
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
 *           schema: { $ref: '#/components/schemas/Course' }
 *     responses:
 *       200:
 *         description: Course updated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Course' }
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
 * /api/v1/courses/{id}:
 *   delete:
 *     summary: Delete a course
 *     tags: [Courses]
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
 *     Course:
 *       type: object
 *       properties:
 *         id:    { type: string }
 *         name:  { type: string }
 *         color: { type: string }
 */

export default router;
