<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Episode
 *
 * @ORM\Table(name="episodes", indexes={@ORM\Index(name="fk_episodes_avcontent", columns={"avc_id"})})
 * @ORM\Entity
 */
class Episode
{
    /**
     * @var int
     *
     * @ORM\Column(name="id", type="integer", nullable=false)
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="IDENTITY")
     */
    private $id;

    /**
     * @var string
     *
     * @ORM\Column(name="title", type="string", length=255, nullable=false)
     */
    private $title;

    /**
     * @var string|null
     *
     * @ORM\Column(name="description", type="string", length=255, nullable=true)
     */
    private $description;

    /**
     * @var \Avcontent
     *
     * @ORM\ManyToOne(targetEntity="Avcontent")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="avc_id", referencedColumnName="id")
     * })
     */
    private $avc;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): self
    {
        $this->title = $title;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): self
    {
        $this->description = $description;

        return $this;
    }

    public function getAvc(): ?Avcontent
    {
        return $this->avc;
    }

    public function setAvc(?Avcontent $avc): self
    {
        $this->avc = $avc;

        return $this;
    }


}
