<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;

use App\Entity\User;
use App\Entity\Avcontent;
use App\Entity\Episode;
use App\Services\JwtAuth;

class EpisodeController extends AbstractController
{
    private function resjson($data){
        $json = $this->get('serializer')->serialize($data, 'json');
        $response = new Response();
        $response->setContent($json);
        $response->headers->set('Content-Type', 'application/json');
        return $response;
    }

    public function create(Request $request, JwtAuth $jwt_auth){
        $json = $request->get('json', null);
        $params = json_decode($json);
        $token = $request->headers->get('Authorization', null);

        $authCheck = $jwt_auth->checkToken($token);

        $data = [
            'status' => 'error',
            'code' => 500,
            'message' => 'Error al crear el episodio'
        ];

        if($authCheck){
            $em = $this->getDoctrine()->getManager();
            $identity = $jwt_auth->checkToken($token, true);
            $user = $this->getDoctrine()->getRepository(User::class)->findOneBy(['id' => $identity->sub]);
            $avc = $this->getDoctrine()->getRepository(Avcontent::class)->findOneBy(['id' => $params->avc_id]);
            $role = $user->getRole();

            if(!empty($json) && $role == 'admin'){
                $title = (!empty($params->title)) ? $params->title : null;
                $description = (!empty($params->description)) ? $params->description : null;

                if(!empty($title) && is_object($avc)){
                    $episode = new Episode();
                    $episode->setTitle($title);
                    $episode->setDescription($description);
                    $episode->setAvc($avc);

                    $em->persist($episode);
                    $em->flush();

                    $data = [
                        'status' => 'success',
                        'code' => 200,
                        'episode' => $episode,
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
            'message' => 'Error al crear el episodio'
        ];

        if($authCheck){
            $em = $this->getDoctrine()->getManager();
            $identity = $jwt_auth->checkToken($token, true);
            $user = $this->getDoctrine()->getRepository(User::class)->findOneBy(['id' => $identity->sub]);
            $avc = $this->getDoctrine()->getRepository(Avcontent::class)->findOneBy(['id' => $params->avc_id]);
            $role = $user->getRole();

            if(!empty($json) && $role == 'admin'){
                $title = (!empty($params->title)) ? $params->title : null;
                $description = (!empty($params->description)) ? $params->description : null;

                if(!empty($title) && is_object($avc)){
                    $episode = $this->getDoctrine()->getRepository(Episode::class)->findOneBy(['id' => $params->episode_id]);;
                    $episode->setTitle($title);
                    $episode->setDescription($description);
                    $episode->setAvc($avc);

                    $em->persist($episode);
                    $em->flush();

                    $data = [
                        'status' => 'success',
                        'code' => 200,
                        'episode' => $episode,
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

                $episode = $this->getDoctrine()->getRepository(Episode::class)->findOneBy(['id' => $params->episode_id]);
                $reviews = $this->getDoctrine()->getRepository(Review::class)->findBy(['avc' => $episode->getAvc()]);

                if(count($reviews) > 0){
                    for($c=0;count($reviews)>$c;$c++){
                        $em->remove($reviews[$c]);
                    }
                    $em->flush();      
                }
 

                $em->remove($episode);
                $em->flush();

                $data = [
                    'status' => 'success',
                    'code' => 200,
                    'episode' => $episode,
                ];
            }
        }
        return $this->resjson($data);
    }

    public function getEpisodes(Request $request){
        $json = $request->get('json', null);
        $params = json_decode($json);

        $data = [
            'status' => 'error',
            'code' => 500,
            'message' => 'Error al borrar el avc'
        ];

        if(!empty($json)){
            $episodes = $this->getDoctrine()->getRepository(Episode::class)->findBy(['avc' => $params->avc_id]);

            $data = [
                'status' => 'success',
                'code' => 200,
                'episodes' => $episodes
            ];
        }
        return $this->resjson($data);
    }

    public function getEpisode($episode_id = null){
        $data = [
            'status' => 'error',
            'code' => 500,
            'message' => 'Error al borrar el avc'
        ];

        if($episode_id != null){
            $episode = $this->getDoctrine()->getRepository(Episode::class)->findOneBy(['id' => $episode_id]);

            $data = [
                'status' => 'success',
                'code' => 200,
                'episode' => $episode
            ];
        }
        return $this->resjson($data);
    }
}
