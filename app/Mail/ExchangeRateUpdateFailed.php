<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ExchangeRateUpdateFailed extends Mailable
{
    use Queueable, SerializesModels;

    public $errorMessage;
    public $attemptCount;
    public $lastSuccessfulUpdate;

    /**
     * Create a new message instance.
     */
    public function __construct($errorMessage, $attemptCount = 1, $lastSuccessfulUpdate = null)
    {
        $this->errorMessage = $errorMessage;
        $this->attemptCount = $attemptCount;
        $this->lastSuccessfulUpdate = $lastSuccessfulUpdate;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject('Exchange Rate Update Failed - Budget Buddy')
                    ->view('emails.exchange-rate-failed')
                    ->with([
                        'errorMessage' => $this->errorMessage,
                        'attemptCount' => $this->attemptCount,
                        'lastSuccessfulUpdate' => $this->lastSuccessfulUpdate,
                    ]);
    }
}
