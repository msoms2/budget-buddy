<?php

namespace App\Traits;

trait DisableAutoLoading
{
    /**
     * Flag to disable automatic loading during currency conversion
     */
    protected $disableAutoLoading = false;

    /**
     * Disable automatic loading
     */
    public function disableAutoLoading()
    {
        $this->disableAutoLoading = true;
        return $this;
    }

    /**
     * Enable automatic loading
     */
    public function enableAutoLoading()
    {
        $this->disableAutoLoading = false;
        return $this;
    }

    /**
     * Check if automatic loading is disabled
     */
    public function isAutoLoadingDisabled()
    {
        return $this->disableAutoLoading;
    }
}
