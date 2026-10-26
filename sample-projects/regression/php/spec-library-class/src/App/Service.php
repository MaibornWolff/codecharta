<?php

namespace Game\App;

use Psr\Log\LoggerInterface;

class Service
{
    public ?LoggerInterface $logger = null;
    public ?\RuntimeException $failure = null;
}
