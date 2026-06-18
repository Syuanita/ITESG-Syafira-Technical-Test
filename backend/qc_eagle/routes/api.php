<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\InspectionController;

// Endpoint bawaan Laravel
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Endpoint API
Route::post('/inspections/analyze', [InspectionController::class, 'analyze']);
Route::get('/inspections', [InspectionController::class, 'index']);