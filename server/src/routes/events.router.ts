import { Router, Request, Response } from 'express';
import { requireAuth, requirePermission } from '../middleware/auth';
import * as store from '../store/events.store';

const router = Router();

router.get('/', requireAuth, requirePermission('READ'), (_req: Request, res: Response) => {
  res.json(store.getAll());
});

router.get('/:id', requireAuth, requirePermission('READ'), (req: Request, res: Response) => {
  const item = store.getById(req.params.id);
  if (!item) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(item);
});

router.post('/', requireAuth, requirePermission('WRITE'), (req: Request, res: Response) => {
  const item = store.create(req.body);
  res.status(201).json(item);
});

router.put('/:id', requireAuth, requirePermission('WRITE'), (req: Request, res: Response) => {
  const item = store.update(req.params.id, req.body);
  if (!item) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(item);
});

router.delete('/:id', requireAuth, requirePermission('DELETE'), (req: Request, res: Response) => {
  const ok = store.remove(req.params.id);
  if (!ok) { res.status(404).json({ error: 'Not found' }); return; }
  res.status(204).send();
});

export default router;
