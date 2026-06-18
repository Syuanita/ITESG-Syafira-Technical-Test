<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Inspection extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 
        'product_id', 
        'image_path', 
        'status', 
        'defect_notes', 
        'confidence_score'
    ];
}