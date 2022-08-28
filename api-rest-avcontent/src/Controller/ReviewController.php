<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;

use App\Entity\User;
use App\Entity\Review;
use App\Entity\Avcontent;
use App\Entity\Episode;
use App\Services\JwtAuth;

class ReviewController extends AbstractController
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
            'message' => 'Error al crear la review'
        ];

        if($authCheck){
            $em = $this->getDoctrine()->getManager();
            $identity = $jwt_auth->checkToken($token, true);
            $user = $this->getDoctrine()->getRepository(User::class)->findOneBy(['id' => $identity->sub]);

            if(!empty($json)){
                $content = (!empty($params->content)) ? $params->content : null;
                $score = (!empty($params->score)) ? $params->score : null;
                $avc = $this->getDoctrine()->getRepository(Avcontent::class)->findOneBy(['id' => $params->avc_id]);

                $review_done = $this->getDoctrine()->getRepository(Review::class)->findOneBy(['avc' => $params->avc_id, 'user' => $user]);

                if($params->episode_id != null){
                    $episode = $this->getDoctrine()->getRepository(Episode::class)->findOneBy(['id' => $params->episode_id]);
                    $review_done = $this->getDoctrine()->getRepository(Review::class)->findOneBy(['avc' => $avc, 'user' => $user, 'episode' => $episode]);
                }

                if($review_done == null){
                    if(!empty($content) && !empty($score)){
                        $review = new Review();
                        $review->setContent($content);
                        $review->setScore($score);
                        $review->setCreatedAt(new \Datetime('now'));
                        $review->setUpdatedAt(new \Datetime('now'));
                        $review->setAvc($avc);
                        $review->setUser($user);

                        if($params->episode_id != null){
                            $review->setEpisode($episode);
                        }

                        $em->persist($review);
                        $em->flush();

                        $data = [
                            'status' => 'success',
                            'code' => 200,
                            'review' => $review
                        ];
                    }  else {
                        $data = [
                            'status' => 'error',
                            'code' => 400,
                            'message' => 'Hay campos vacíos'
                        ];
                    }   
                } else {
                        $data = [
                            'status' => 'error',
                            'code' => 400,
                            'message' => 'Ya has reseña´do ese contenido'
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
            'message' => 'Error al crear la review'
        ];

        if($authCheck){
            $em = $this->getDoctrine()->getManager();
            $identity = $jwt_auth->checkToken($token, true);
            $user = $this->getDoctrine()->getRepository(User::class)->findOneBy(['id' => $identity->sub]);
            $review = $this->getDoctrine()->getRepository(Review::class)->findOneBy(['id' => $params->review_id]);

            if(!empty($json)){
                $content = (!empty($params->content)) ? $params->content : null;
                $score = (!empty($params->score)) ? $params->score : null;

                if($review->getUser()->getId() == $user->getId()){
                    if(!empty($content) && !empty($score)){
                        $review->setContent($content);
                        $review->setScore($score);
                        $review->setUpdatedAt(new \Datetime('now'));

                        $em->persist($review);
                        $em->flush();

                        $data = [
                            'status' => 'success',
                            'code' => 200,
                            'review' => $review
                        ];
                    }  else {
                        $data = [
                            'status' => 'error',
                            'code' => 400,
                            'message' => 'Hay campos vacíos'
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

            if(!empty($json)){

                $review = $this->getDoctrine()->getRepository(Review::class)->findOneBy(['id' => $params->review_id]);;

                $em->remove($review);
                $em->flush();

                $data = [
                    'status' => 'success',
                    'code' => 200,
                    'review' => $review,
                ];
            }
        }
        return $this->resjson($data);
    }

    public function getAvcReviews(Request $request){
        $json = $request->get('json', null);
        $params = json_decode($json);

        $data = [
            'status' => 'error',
            'code' => 500,
            'message' => 'Error'
        ];

        if(!empty($json)){
            $avc_reviews = $this->getDoctrine()->getRepository(Review::class)->findBy(['avc' => $params->avc_id]);

            $data = [
                'status' => 'success',
                'code' => 200,
                'reviews' => $avc_reviews
            ];
        }

        return $this->resjson($data);
    }

    public function getUserReview(Request $request, JwtAuth $jwt_auth){
        $json = $request->get('json', null);
        $params = json_decode($json);
        $token = $request->headers->get('Authorization', null);

        $data = [
            'status' => 'error',
            'code' => 500,
            'message' => 'Error'
        ];

        $authCheck = $jwt_auth->checkToken($token);

        if(!empty($json) && $authCheck){
            $identity = $jwt_auth->checkToken($token, true);
            $review = $this->getDoctrine()->getRepository(Review::class)->findOneBy(['avc' => $params->avc_id, 'user' => $identity->sub]);

            if($params->episode_id != null){
                $review = $this->getDoctrine()->getRepository(Review::class)->findOneBy(['avc' => $params->avc_id, 'episode' => $params->episode_id, 'user' => $identity->sub]);
            }

            $data = [
                'status' => 'success',
                'code' => 200,
                'review' => $review
            ];
        }

        return $this->resjson($data); 
    }

    public function getReviews(Request $request){
        $json = $request->get('json', null);
        $params = json_decode($json);

        $data = [
            'status' => 'error',
            'code' => 500,
            'message' => 'Error'
        ];

        $reviews = $this->getDoctrine()->getRepository(Review::class)->findBy(['avc' => $params->avc_id, 'episode' => $params->episode_id]);

        $data = [
            'status' => 'success',
            'code' => 200,
            'reviews' => $reviews
        ];

        return $this->resjson($data);
    }

    public function getUserReviews(Request $request, JwtAuth $jwt_auth){
        $token = $request->headers->get('Authorization', null);
        $json = $request->get('json', null);
        $params = json_decode($json);

        $data = [
            'status' => 'error',
            'code' => 500,
            'message' => 'Error'
        ];

        $authCheck = $jwt_auth->checkToken($token);

        if($authCheck && $params->user_id == null){
            $identity = $jwt_auth->checkToken($token, true);
            $reviews = $this->getDoctrine()->getRepository(Review::class)->findBy(['user' => $identity->sub]);

            $data = [
                'status' => 'success',
                'code' => 200,
                'reviews' => $reviews
            ];
        } else if($params->user_id){
            $reviews = $this->getDoctrine()->getRepository(Review::class)->findBy(['user' => $user_id]);

            $data = [
                'status' => 'success',
                'code' => 200,
                'reviews' => $reviews
            ];
        }

        return $this->resjson($data);
    }
}
