<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\File\Exception\FileException;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\String\Slugger\SluggerInterface;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

use App\Entity\User;
use App\Entity\Avcontent;
use App\Entity\Episode;
use App\Entity\Review;
use App\Services\JwtAuth;

class AvcController extends AbstractController
{
    private function resjson($data){
        $json = $this->get('serializer')->serialize($data, 'json');
        $response = new Response();
        $response->setContent($json);
        $response->headers->set('Content-Type', 'application/json');
        return $response;
    }

    public function getAvc($avc_id = null){
        $data = [
            'status' => 'error',
            'code' => 400,
            'message' => 'Error'
        ];

        $avc = $this->getDoctrine()->getRepository(Avcontent::Class)->findOneBy(['id' => $avc_id]);

        if(is_object($avc)){
            $data = [
                'status' => 'success',
                'code' => 200,
                'avc' => $avc
            ];
        }

        return $this->resjson($data);
    }

    public function getLastAvcs(){

        $avcs = $this->getDoctrine()->getRepository(Avcontent::Class)->findAll();

        $data = [
            'status' => 'success',
            'code' => 200,
            'avcs' => $avcs
        ];

        return $this->resjson($data);
    }

    public function create(Request $request, JwtAuth $jwt_auth){
        $json = $request->get('json', null);
        $params = json_decode($json);
        $token = $request->headers->get('Authorization', null);

        $authCheck = $jwt_auth->checkToken($token);

        $data = [
            'status' => 'error',
            'code' => 500,
            'message' => 'Error al crear el avc'
        ];

        if($authCheck){
            $em = $this->getDoctrine()->getManager();
            $identity = $jwt_auth->checkToken($token, true);
            $user = $this->getDoctrine()->getRepository(User::class)->findOneBy(['id' => $identity->sub]);
            $role = $user->getRole();

            if(!empty($json) && $role == 'admin'){
                $title = (!empty($params->title)) ? $params->title : null;
                $description = (!empty($params->description)) ? $params->description : null;
                $type = (!empty($params->type)) ? $params->type : null;
                $duration = (!empty($params->duration)) ? $params->duration : null;
                $duration = (int)$duration;
                $episodes = (!empty($params->episodes)) ? $params->episodes : null;
                $episodes = (int)$episodes;
                $country = (!empty($params->country)) ? $params->country : null;
                $director = (!empty($params->director)) ? $params->director : null;

                if(!empty($title) && !empty($description) && !empty($type) && !empty($duration) && !empty($country)){
                    $avc = new Avcontent();
                    $avc->setTitle($title);
                    $avc->setDescription($description);
                    $avc->setType($type);
                    $avc->setDuration($duration);
                    $avc->setEpisodes($episodes);
                    $avc->setCountry($country);
                    $avc->setDirector($director);

                    $em->persist($avc);
                    $em->flush();

                    $data = [
                        'status' => 'success',
                        'code' => 200,
                        'avc' => $avc,
                    ];
                }
            }
        }
        return $this->resjson($data);
    }

    public function update(Request $request, JwtAuth $jwt_auth){
        $json = $request->get('json', null);
        $params = json_decode($json);
        $token = $request->headers->get('Authorization', null);

        $authCheck = $jwt_auth->checkToken($token);

        $data = [
            'status' => 'error',
            'code' => 500,
            'message' => 'Error al crear el avc'
        ];

        if($authCheck){
            $em = $this->getDoctrine()->getManager();
            $identity = $jwt_auth->checkToken($token, true);
            $user = $this->getDoctrine()->getRepository(User::class)->findOneBy(['id' => $identity->sub]);
            $role = $user->getRole();

            if(!empty($json) && $role == 'admin'){
                $title = (!empty($params->title)) ? $params->title : null;
                $description = (!empty($params->description)) ? $params->description : null;
                $type = (!empty($params->type)) ? $params->type : null;
                $duration = (!empty($params->duration)) ? $params->duration : null;
                $duration = (int)$duration;
                $episodes = (!empty($params->episodes)) ? $params->episodes : null;
                $country = (!empty($params->country)) ? $params->country : null;
                $director = (!empty($params->director)) ? $params->director : null;

                if(!empty($title) && !empty($description) && !empty($type) && !empty($duration) && !empty($country)){
                    $avc = $this->getDoctrine()->getRepository(Avcontent::class)->findOneBy(['id' => $params->avc_id]);;
                    $avc->setTitle($title);
                    $avc->setDescription($description);
                    $avc->setType($type);
                    $avc->setDuration($duration);
                    $avc->setEpisodes($episodes);
                    $avc->setCountry($country);
                    $avc->setDirector($director);

                    $em->persist($avc);
                    $em->flush();

                    $data = [
                        'status' => 'success',
                        'code' => 200,
                        'avc' => $avc,
                    ];
                }
            }
        }
        return $this->resjson($data);
    }

    public function delete(Request $request, JwtAuth $jwt_auth){
        $json = $request->get('json', null);
        $params = json_decode($json);
        $token = $request->headers->get('Authorization', null);

        $authCheck = $jwt_auth->checkToken($token);

        $data = [
            'status' => 'error',
            'code' => 500,
            'message' => 'Error al borrar el avc'
        ];

        if($authCheck){
            $em = $this->getDoctrine()->getManager();
            $identity = $jwt_auth->checkToken($token, true);
            $user = $this->getDoctrine()->getRepository(User::class)->findOneBy(['id' => $identity->sub]);
            $role = $user->getRole();

            if(!empty($json) && $role == 'admin'){

                $avc = $this->getDoctrine()->getRepository(Avcontent::class)->findOneBy(['id' => $params->avc_id]);;
                $episodes = $this->getDoctrine()->getRepository(Episode::class)->findBy(['avc' => $avc]);

                if(count($episodes)>0){
                    for($c=0;count($episodes)>$c;$c++){
                        $episode = $episodes[$c]->getAvc();
                        $reviews = $this->getDoctrine()->getRepository(Review::class)->findBy(['episode' => $episode]);

                        if(count($reviews) > 0){
                            for($c2=0;count($reviews)>$c2;$c2++){
                                $em->remove($reviews[$c2]);
                            }
                            $em->flush();      
                        }
                        $em->remove($episode[$c]);
                    }
                    $em->flush();
                } else {
                    $reviews = $this->getDoctrine()->getRepository(Review::class)->findBy(['avc' => $avc]);
                    if(count($reviews) > 0){
                        for($c=0;count($reviews)>$c;$c++){
                            $em->remove($reviews[$c]);
                        }
                        $em->flush();      
                    }
                }

                $em->remove($avc);
                $em->flush();

                $data = [
                    'status' => 'success',
                    'code' => 200,
                    'avc' => $avc,
                ];
            }
        }
        return $this->resjson($data);
    }

    public function uploadImage(Request $request, SluggerInterface $slugger, JwtAuth $jwt_auth, $avc_id){

        $data = [
            'status' => 'error',
            'code' => 400,
            'message' => 'Error al subir la imagen'
        ];
        $doctrine = $this->getDoctrine();
        $token = $request->headers->get('Authorization', null);
        $authCheck = $jwt_auth->checkToken($token);

        if($authCheck){
            $file = $request->files->get('filename', null);

            $filename = $file->getClientOriginalName();
            $safeFilename = $slugger->slug($filename);
            $newFilename = uniqid().'-'.$safeFilename.'.'.$file->guessExtension();

            $identity = $jwt_auth->checkToken($token, true);
            $user_id = (!empty($identity->sub)) ? $identity->sub : null;
            $user = $doctrine->getRepository(User::class)->findOneBy(['id' => $user_id]);

            if($identity && $user->getRole() == 'admin'){
                if(!empty($file)){
                    $avc = $doctrine->getRepository(Avcontent::class)->findOneBy(['id' => $avc_id]);

                    $avc->setImage($newFilename);

                    $file->move(
                        $this->getParameter('avc_images'),
                        $newFilename
                    );

                    //Y la metemos en la base de datos
                    $em = $doctrine->getManager();
                    $em->persist($user);
                    $em->flush();

                    $data = [
                        'status' => 'success',
                        'code' => '200',
                        'user' => $user
                    ];
                } else {
                    $data = [
                        'status' => 'error',
                        'code' => 400,
                        'message' => 'Error al coger la imagen'
                    ];                    
                }
            } else {
                $data = [
                    'status' => 'error',
                    'code' => 400,
                    'message' => 'Error de autorización'
                ];
            }
        }
        return $this->resjson($data);
    }

    public function getImage($filename = null){
        $path = $this->getParameter('avc_images');

        return new BinaryFileResponse($path.'/'.$filename);
    }

    public function search(Request $request, $search = null){
        $busqueda = (!empty($search)) ? $search : null;

        $data = [
            'status' => 'error',
            'code' => 400,
            'message' => 'No hay resultados de búsqueda'
        ];

        $resultado = $this->getDoctrine()->getRepository(Avcontent::class)->createQueryBuilder('a')
                                         ->where('a.title LIKE :busqueda')
                                         ->orWhere('a.director LIKE :busqueda')
                                         ->setParameter('busqueda', '%'.$busqueda.'%')
                                         ->getQuery()
                                         ->getResult();

        $data = [
            'status' => 'success',
            'code' => 200,
            'avc' => $resultado
        ];

        return $this->resjson($data);
    }
}
