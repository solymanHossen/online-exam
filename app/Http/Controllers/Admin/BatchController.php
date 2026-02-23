<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\BatchResource;
use App\Models\Batch;
use App\Services\BatchService;
use App\Traits\ResponseTrait;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BatchController extends Controller
{
    use ResponseTrait;

    protected BatchService $batchService;

    public function __construct(BatchService $batchService)
    {
        $this->batchService = $batchService;
    }

    public function index(): Response
    {
        $batches = $this->batchService->getPaginatedBatches(15);

        return Inertia::render('Admin/Batches/Index', [
            'batches' => BatchResource::collection($batches),
        ]);
    }

    public function store(\App\Http\Requests\Admin\StoreBatchRequest $request)
    {
        $this->batchService->createBatch($request->validated());

        return redirect()->route('admin.batches.index')->with('success', 'Batch created successfully.');
    }

    public function update(\App\Http\Requests\Admin\UpdateBatchRequest $request, Batch $batch)
    {
        $this->batchService->updateBatch($batch, $request->validated());

        return redirect()->route('admin.batches.index')->with('success', 'Batch updated successfully.');
    }

    public function destroy(Batch $batch)
    {
        $this->batchService->deleteBatch($batch);

        return redirect()->route('admin.batches.index')->with('success', 'Batch deleted successfully.');
    }
}
