<?php
$models = [
    'Role.php',
    'Batch.php',
    'Subject.php',
    'Chapter.php',
    'Student.php',
    'Exam.php',
    'Question.php',
    'QuestionOption.php',
    'Payment.php',
    'ExamAttempt.php',
    'StudentAnswer.php'
];

foreach ($models as $model) {
    $path = __DIR__ . '/app/Models/' . $model;
    if (file_exists($path)) {
        $content = file_get_contents($path);

        if (strpos($content, 'HasFactory') === false) {
            $content = str_replace(
                "use Illuminate\Database\Eloquent\Model;",
                "use Illuminate\Database\Eloquent\Model;\nuse Illuminate\Database\Eloquent\Factories\HasFactory;",
                $content
            );
            $content = str_replace(
                "use HasUuids;",
                "use HasFactory, HasUuids;",
                $content
            );
            file_put_contents($path, $content);
        }
    }
}
echo "HasFactory added securely.\n";
